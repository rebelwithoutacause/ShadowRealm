import { Hono } from "hono";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import bcrypt from "bcryptjs";

const app = new Hono<{ Bindings: Env }>();

// Obtain redirect URL from the Mocha Users Service
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

// Exchange the code for a session token
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

// Get the current user object for the frontend
app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

// Call this from the frontend to log out the user
app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  // Delete cookie by setting max age to 0
  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Custom email/password registration
app.post("/api/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters long" }, 400);
    }

    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM custom_users WHERE email = ?"
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: "An account with this email already exists" }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await c.env.DB.prepare(
      "INSERT INTO custom_users (email, password_hash, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))"
    ).bind(email, passwordHash).run();

    if (!result.success) {
      return c.json({ error: "Failed to create account. Please try again." }, 500);
    }

    const userId = result.meta.last_row_id;

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60); // 60 days

    // Store session in database
    await c.env.DB.prepare(
      "INSERT INTO custom_sessions (user_id, session_token, expires_at, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
    ).bind(userId, sessionToken, expiresAt.toISOString()).run();

    // Set session cookie
    setCookie(c, "CUSTOM_SESSION_TOKEN", sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ 
      success: true, 
      user: { 
        id: userId, 
        email,
        created_at: new Date().toISOString()
      } 
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed. Please try again." }, 500);
  }
});

// Custom email/password login
app.post("/api/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address" }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      "SELECT id, email, password_hash, created_at FROM custom_users WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash as string);

    if (!passwordValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60); // 60 days

    // Clean up old sessions for this user
    await c.env.DB.prepare(
      "DELETE FROM custom_sessions WHERE user_id = ? OR expires_at < datetime('now')"
    ).bind(user.id).run();

    // Store session in database
    await c.env.DB.prepare(
      "INSERT INTO custom_sessions (user_id, session_token, expires_at, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))"
    ).bind(user.id, sessionToken, expiresAt.toISOString()).run();

    // Set session cookie
    setCookie(c, "CUSTOM_SESSION_TOKEN", sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 60 * 24 * 60 * 60, // 60 days
    });

    return c.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email,
        created_at: user.created_at
      } 
    }, 200);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed. Please try again." }, 500);
  }
});

// Get current custom user
app.get("/api/auth/me", async (c) => {
  try {
    const sessionToken = getCookie(c, "CUSTOM_SESSION_TOKEN");
    
    if (!sessionToken) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    // Find session and user
    const session = await c.env.DB.prepare(
      "SELECT cs.*, cu.email, cu.created_at FROM custom_sessions cs JOIN custom_users cu ON cs.user_id = cu.id WHERE cs.session_token = ? AND cs.expires_at > datetime('now')"
    ).bind(sessionToken).first();

    if (!session) {
      // Clean up invalid session
      setCookie(c, "CUSTOM_SESSION_TOKEN", "", {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        secure: true,
        maxAge: 0,
      });
      return c.json({ error: "Session expired" }, 401);
    }

    return c.json({ 
      authenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        created_at: session.created_at
      }
    }, 200);
  } catch (error) {
    return c.json({ error: "Authentication failed" }, 401);
  }
});

// Custom logout
app.post("/api/auth/logout", async (c) => {
  const sessionToken = getCookie(c, "CUSTOM_SESSION_TOKEN");
  
  if (sessionToken) {
    // Remove session from database
    await c.env.DB.prepare(
      "DELETE FROM custom_sessions WHERE session_token = ?"
    ).bind(sessionToken).run();
  }

  // Clear cookie
  setCookie(c, "CUSTOM_SESSION_TOKEN", "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

export default app;
