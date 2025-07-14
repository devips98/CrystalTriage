import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  insertPostSchema, 
  insertConfessionSchema, 
  insertMessageSchema, 
  insertChallengeSchema,
  insertGeoTimeCapsuleSchema,
  insertGeoSwapSchema,
  insertOfflinePostSchema 
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// WebSocket connections storage
const wsConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('userId=')[1]?.split('&')[0];
    
    if (userId) {
      wsConnections.set(userId, ws);
      console.log(`WebSocket connected for user: ${userId}`);
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleWebSocketMessage(data, ws, userId);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        wsConnections.delete(userId);
        console.log(`WebSocket disconnected for user: ${userId}`);
      }
    });
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // Geolocation and posts
  app.get('/api/posts/nearby', async (req, res) => {
    try {
      const { latitude, longitude, radius = 500 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const posts = await storage.getNearbyPosts(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );

      res.json(posts);
    } catch (error) {
      console.error('Error fetching nearby posts:', error);
      res.status(500).json({ error: 'Failed to fetch nearby posts' });
    }
  });

  app.post('/api/posts', upload.single('media'), async (req, res) => {
    try {
      const postData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        visibilityRadius: parseInt(req.body.visibilityRadius) || 500,
        isTruthMode: req.body.isTruthMode === 'true',
        isAnonymous: req.body.isAnonymous === 'true',
      };

      const validatedData = insertPostSchema.parse(postData);
      const post = await storage.createPost(validatedData);

      // Notify nearby users via WebSocket
      broadcastToNearbyUsers(post.latitude, post.longitude, post.visibilityRadius || 500, {
        type: 'new_post',
        data: post
      });

      res.json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.post('/api/posts/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await storage.likePost(parseInt(id), userId);
      const likes = await storage.getPostLikes(parseInt(id));

      res.json({ likes });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  });

  app.delete('/api/posts/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      await storage.unlikePost(parseInt(id), userId);
      const likes = await storage.getPostLikes(parseInt(id));

      res.json({ likes });
    } catch (error) {
      console.error('Error unliking post:', error);
      res.status(500).json({ error: 'Failed to unlike post' });
    }
  });

  app.post('/api/posts/:id/comment', async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, content } = req.body;

      await storage.commentOnPost(parseInt(id), userId, content);
      const comments = await storage.getPostComments(parseInt(id));

      res.json(comments);
    } catch (error) {
      console.error('Error commenting on post:', error);
      res.status(500).json({ error: 'Failed to comment on post' });
    }
  });

  // Confessions
  app.get('/api/confessions/nearby', async (req, res) => {
    try {
      const { latitude, longitude, radius = 200 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const confessions = await storage.getNearbyConfessions(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );

      res.json(confessions);
    } catch (error) {
      console.error('Error fetching nearby confessions:', error);
      res.status(500).json({ error: 'Failed to fetch nearby confessions' });
    }
  });

  app.post('/api/confessions', async (req, res) => {
    try {
      const confessionData = {
        ...req.body,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        visibilityRadius: parseInt(req.body.visibilityRadius) || 200,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      };

      const validatedData = insertConfessionSchema.parse(confessionData);
      const confession = await storage.createConfession(validatedData);

      res.json(confession);
    } catch (error) {
      console.error('Error creating confession:', error);
      res.status(500).json({ error: 'Failed to create confession' });
    }
  });

  app.post('/api/confessions/:id/react', async (req, res) => {
    try {
      const { id } = req.params;
      const { emoji } = req.body;

      await storage.addConfessionReaction(parseInt(id), emoji);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reacting to confession:', error);
      res.status(500).json({ error: 'Failed to react to confession' });
    }
  });

  // Messages
  app.get('/api/messages/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { otherUserId } = req.query;

      if (otherUserId) {
        const messages = await storage.getUserMessages(userId, otherUserId as string);
        res.json(messages);
      } else {
        const conversations = await storage.getUserConversations(userId);
        res.json(conversations);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);

      // Send real-time message to recipient
      const recipientWs = wsConnections.get(message.receiverId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'new_message',
          data: message
        }));
      }

      res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Challenges
  app.get('/api/challenges/nearby', async (req, res) => {
    try {
      const { latitude, longitude, radius = 1000 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const challenges = await storage.getNearbyActiveChallenges(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );

      res.json(challenges);
    } catch (error) {
      console.error('Error fetching nearby challenges:', error);
      res.status(500).json({ error: 'Failed to fetch nearby challenges' });
    }
  });

  app.post('/api/challenges', async (req, res) => {
    try {
      const challengeData = {
        ...req.body,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        visibilityRadius: parseInt(req.body.visibilityRadius) || 1000,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      };

      const validatedData = insertChallengeSchema.parse(challengeData);
      const challenge = await storage.createChallenge(validatedData);

      res.json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({ error: 'Failed to create challenge' });
    }
  });

  app.post('/api/challenges/:id/participate', upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Image is required for challenge participation' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      await storage.participateInChallenge(parseInt(id), userId, imageUrl);

      res.json({ success: true });
    } catch (error) {
      console.error('Error participating in challenge:', error);
      res.status(500).json({ error: 'Failed to participate in challenge' });
    }
  });

  // GeoTime Capsules
  app.get('/api/geotimecapsules/available', async (req, res) => {
    try {
      const { latitude, longitude } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const capsules = await storage.getAvailableGeoTimeCapsules(
        parseFloat(latitude as string),
        parseFloat(longitude as string)
      );

      res.json(capsules);
    } catch (error) {
      console.error('Error fetching available geo time capsules:', error);
      res.status(500).json({ error: 'Failed to fetch available geo time capsules' });
    }
  });

  app.post('/api/geotimecapsules', upload.single('image'), async (req, res) => {
    try {
      const capsuleData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        scheduledFor: new Date(req.body.scheduledFor),
        visibilityRadius: parseInt(req.body.visibilityRadius) || 100,
      };

      const validatedData = insertGeoTimeCapsuleSchema.parse(capsuleData);
      const capsule = await storage.createGeoTimeCapsule(validatedData);

      res.json(capsule);
    } catch (error) {
      console.error('Error creating geo time capsule:', error);
      res.status(500).json({ error: 'Failed to create geo time capsule' });
    }
  });

  app.post('/api/geotimecapsules/:id/open', async (req, res) => {
    try {
      const { id } = req.params;

      await storage.openGeoTimeCapsule(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error opening geo time capsule:', error);
      res.status(500).json({ error: 'Failed to open geo time capsule' });
    }
  });

  // GeoSwap
  app.get('/api/geoswap/opportunities', async (req, res) => {
    try {
      const { latitude, longitude, userId } = req.query;
      
      if (!latitude || !longitude || !userId) {
        return res.status(400).json({ error: 'Latitude, longitude, and userId are required' });
      }

      const opportunities = await storage.findNearbyGeoSwapOpportunities(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        userId as string
      );

      res.json(opportunities);
    } catch (error) {
      console.error('Error finding geo swap opportunities:', error);
      res.status(500).json({ error: 'Failed to find geo swap opportunities' });
    }
  });

  app.post('/api/geoswap', async (req, res) => {
    try {
      const swapData = {
        ...req.body,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      };

      const validatedData = insertGeoSwapSchema.parse(swapData);
      const swap = await storage.createGeoSwap(validatedData);

      res.json(swap);
    } catch (error) {
      console.error('Error creating geo swap:', error);
      res.status(500).json({ error: 'Failed to create geo swap' });
    }
  });

  app.post('/api/geoswap/:id/submit', upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'Image is required for geo swap submission' });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      await storage.completeGeoSwap(parseInt(id), userId, imageUrl);

      res.json({ success: true });
    } catch (error) {
      console.error('Error submitting to geo swap:', error);
      res.status(500).json({ error: 'Failed to submit to geo swap' });
    }
  });

  // Offline posts
  app.post('/api/offlineposts', upload.single('image'), async (req, res) => {
    try {
      const postData = {
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        triggerLatitude: parseFloat(req.body.triggerLatitude),
        triggerLongitude: parseFloat(req.body.triggerLongitude),
        triggerRadius: parseInt(req.body.triggerRadius) || 50,
      };

      const validatedData = insertOfflinePostSchema.parse(postData);
      const offlinePost = await storage.createOfflinePost(validatedData);

      res.json(offlinePost);
    } catch (error) {
      console.error('Error creating offline post:', error);
      res.status(500).json({ error: 'Failed to create offline post' });
    }
  });

  app.post('/api/offlineposts/check', async (req, res) => {
    try {
      const { userId, latitude, longitude } = req.body;

      const triggeredPosts = await storage.checkAndTriggerOfflinePosts(
        userId,
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json(triggeredPosts);
    } catch (error) {
      console.error('Error checking offline posts:', error);
      res.status(500).json({ error: 'Failed to check offline posts' });
    }
  });

  // Daily summary
  app.get('/api/summary/daily', async (req, res) => {
    try {
      const { latitude, longitude, radius = 1000 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }

      const summary = await storage.generateDailySummary(
        parseFloat(latitude as string),
        parseFloat(longitude as string),
        parseInt(radius as string)
      );

      res.json({ summary });
    } catch (error) {
      console.error('Error generating daily summary:', error);
      res.status(500).json({ error: 'Failed to generate daily summary' });
    }
  });

  // Cleanup expired content (scheduled job endpoint)
  app.post('/api/cleanup', async (req, res) => {
    try {
      await storage.cleanupExpiredContent();
      res.json({ success: true });
    } catch (error) {
      console.error('Error cleaning up expired content:', error);
      res.status(500).json({ error: 'Failed to cleanup expired content' });
    }
  });

  // Utility functions
  function handleWebSocketMessage(data: any, ws: WebSocket, userId?: string) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'location_update':
        // Handle location updates for proximity awareness
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  function broadcastToNearbyUsers(latitude: number, longitude: number, radius: number, message: any) {
    // This is a simplified implementation
    // In a real app, you'd query the database for users within the radius
    wsConnections.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Schedule cleanup job (in production, use a proper job scheduler)
  setInterval(async () => {
    try {
      await storage.cleanupExpiredContent();
      console.log('Cleanup job completed');
    } catch (error) {
      console.error('Cleanup job failed:', error);
    }
  }, 60 * 60 * 1000); // Run every hour

  return httpServer;
}
