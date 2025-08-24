# Murder on the Bullet Express

A production-ready React + Phaser 3 ESL browser game for students aged 12-15. Step aboard the luxurious Bullet Express where a mysterious murder has occurred, and use your detective skills and English knowledge to solve the case!

## 🎮 Game Overview

**Murder on the Bullet Express** is an educational detective mystery game that combines:
- **Interactive Investigation**: Point-and-click exploration of a steampunk train carriage
- **ESL Learning**: Grammar practice, vocabulary building, and listening comprehension
- **Real-time Collaboration**: Teacher-student synchronization with live controls
- **Mini-games**: Letter reconstruction puzzles and gap-fill listening exercises
- **Progressive Web App**: Installable, offline-capable gameplay

### Target Audience
- **Students**: Ages 12-15, intermediate English learners
- **Teachers**: ESL educators looking for engaging interactive content
- **Duration**: 30-45 minutes per case

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Phaser 3
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Hosting**: Vercel Hobby plan
- **Analytics**: Plausible (privacy-focused)
- **PWA**: Service Worker, Web App Manifest

### Project Structure
```
apps/
  client/                 # Next.js application
    src/
      app/                # App router pages
        conductor/        # Teacher dashboard (/conductor?room=CODE)
        play/            # Student interface (/play?room=CODE)
        menu/            # Main menu and room entry
      components/         # React components
      game/              # Phaser 3 game logic
        scenes/          # Game scenes (Boot, Menu, Carriage, etc.)
      lib/               # Utilities and Supabase client
      stores/            # Zustand state management
      hooks/             # Custom React hooks
    public/
      manifest.json      # PWA manifest
      sw.js             # Service worker
packages/
  shared/               # Shared types and data
    src/
      types/            # TypeScript definitions
      data/             # Case JSON files (case_01.json)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd murder-on-the-bullet-express
npm install
```

### 2. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and anon key

#### Create Database Schema
Run this SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  scene VARCHAR(50) DEFAULT 'menu',
  teacher_id UUID,
  student_id UUID,
  killer_id VARCHAR(50),
  lens_charges INTEGER DEFAULT 3,
  inventory JSONB DEFAULT '{"items": []}',
  hotspots JSONB DEFAULT '{"discovered": []}',
  suspects JSONB DEFAULT '{"list": []}',
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  actor VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat table
CREATE TABLE chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow room access to participants" ON rooms
  FOR ALL USING (
    auth.uid() = teacher_id OR 
    auth.uid() = student_id OR
    auth.role() = 'anon'
  );

CREATE POLICY "Allow journal access to room participants" ON journal_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = journal_entries.room_id 
      AND (rooms.teacher_id = auth.uid() OR rooms.student_id = auth.uid())
    )
  );

CREATE POLICY "Allow chat access to room participants" ON chat
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE rooms.id = chat.room_id 
      AND (rooms.teacher_id = auth.uid() OR rooms.student_id = auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX rooms_code_idx ON rooms(code);
CREATE INDEX journal_entries_room_id_idx ON journal_entries(room_id);
CREATE INDEX chat_room_id_idx ON chat(room_id);
```

#### Enable Realtime
1. Go to Settings > API in your Supabase dashboard
2. Enable Realtime for tables: `rooms`, `journal_entries`, `chat`

### 3. Configure Environment
Create `apps/client/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com  # Optional
```

### 4. Add Game Assets
Place these files in `apps/client/public/`:

```
images/
  logo.png                # Game logo
  carriage_bg.jpg         # Main investigation scene
  menu_bg.jpg             # Menu background
  lestrange.png           # Professor LeStrange sprite
  gaspard.png             # Chef Gaspard sprite
  zane.png                # Captain Zane sprite
  victim.png              # Victim sprite
  ui/                     # UI elements
    inventory_panel.png
    journal_panel.png
    lens_icon.png
    button.png
  items/                  # Evidence items
    knife.png
    letter.png
    book.png
    gear.png
    glass.png
    logbook.png

audio/
  train_ambient.ogg       # Background ambience
  click.ogg              # UI sounds
  discovery.ogg          # Clue discovery
  mystery.ogg            # Background music

icons/                   # PWA icons
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-192x192.png
  icon-384x384.png
  icon-512x512.png

fonts/
  steampunk-pixel.woff2  # Custom font
```

### 5. Run Development Server
```bash
npm run dev
```

Visit:
- **Student Interface**: http://localhost:3000/menu
- **Teacher Dashboard**: http://localhost:3000/conductor

## 🎯 Game Features

### Core Gameplay
- **Investigation**: Click hotspots to examine clues and interact with suspects
- **Dialogue System**: Choose responses that practice specific English grammar points
- **Evidence Collection**: Gather clues to build your case
- **Insight Lens**: Limited-use ability to discover hidden information
- **Accusation Phase**: Present your case and identify the killer

### Mini-Games

#### 1. Letter Reconstruction
- **Objective**: Piece together a torn blackmail letter
- **ESL Focus**: Reading comprehension, vocabulary
- **Mechanics**: Drag and rotate letter fragments into correct positions

#### 2. Gap-Fill Listening
- **Objective**: Complete sentences while listening to audio
- **ESL Focus**: Listening skills, past tenses, modal verbs
- **Mechanics**: Choose correct words from multiple choice options

### Real-time Features
- **Teacher Controls**: Pause/resume, grant lens charges, change scenes, send broadcasts
- **Live Sync**: All game state synchronized between teacher and student
- **Communication**: Built-in chat system for guidance and feedback
- **Progress Tracking**: Automatic journal logging of discoveries and interactions

## 👩‍🏫 Teacher Guide

### Getting Started
1. Visit `/conductor` to access the control panel
2. Click "Start New Case" to generate a 6-character room code
3. Share the room code with your student
4. Student visits `/play?room=CODE` to join

### Teaching Controls

#### Scene Management
- **Menu**: Pre-game lobby
- **Carriage**: Main investigation scene
- **Accuse**: Student makes accusation
- **Debrief**: Review results and learning outcomes

#### Interactive Controls
- **Pause/Resume**: Freeze student interaction when needed
- **Grant Insight Lens**: Give extra investigation charges
- **Broadcast Messages**: Send guidance as "Conductor Whibury"
- **Quick Actions**: Pre-written encouraging/redirecting messages

#### Monitoring Tools
- **Live Journal**: See all student discoveries and interactions
- **Chat System**: Two-way communication channel
- **Progress Tracking**: Monitor clues found and scenes completed

### Pedagogical Features
- **Grammar Focus**: Past tenses, modal verbs, passive voice
- **Vocabulary Building**: Crime/mystery terminology, descriptive language
- **Listening Practice**: Audio-based clues and dialogue
- **Reading Comprehension**: Clue descriptions and evidence analysis
- **Speaking Practice**: Role-playing dialogue choices

## 🎮 Student Experience

### How to Play
1. Receive room code from teacher
2. Visit the game URL and enter code
3. Explore the train carriage by clicking on objects and people
4. Complete mini-games to uncover evidence
5. Use English skills to understand clues and dialogue
6. Make final accusation when ready

### Learning Objectives
- **Past Tenses**: Describe events and actions in crime context
- **Modal Verbs**: Express possibility, speculation, and deduction
- **Crime Vocabulary**: Learn investigation and mystery terminology
- **Listening Skills**: Process audio clues and conversations
- **Critical Thinking**: Analyze evidence to solve the mystery

### Game Mechanics
- **Insight Lens**: Limited charges for deep investigation
- **Evidence Bag**: Automatic collection and organization
- **Journal**: Auto-logging of discoveries and interactions
- **Dialogue Choices**: Practice grammar through conversation options

## 🚀 Deployment

### Vercel Deployment

1. **Prepare for deployment**:
```bash
npm run build
```

2. **Deploy to Vercel**:
```bash
npx vercel --prod
```

3. **Configure environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

4. **Custom domain** (optional):
   - Configure your domain in Vercel settings
   - Update Plausible analytics domain

### PWA Deployment Checklist
- [ ] Service worker registered (`/sw.js`)
- [ ] Web manifest configured (`/manifest.json`)
- [ ] Icons generated for all required sizes
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Install prompt implemented

### Performance Optimization
- [ ] Images optimized and compressed (<3MB total payload)
- [ ] Audio files converted to OGG format
- [ ] Service worker caching configured
- [ ] Lazy loading implemented for game assets
- [ ] Preload critical resources

## 🔧 Development

### Project Commands
```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript checking

# Monorepo
turbo run dev         # Run all packages in dev mode
turbo run build       # Build all packages
turbo run lint        # Lint all packages
```

### Adding New Cases
1. Create new case JSON in `packages/shared/src/data/`
2. Update case selection logic in game scenes
3. Add new suspect sprites and scene backgrounds
4. Test all dialogue nodes and mini-games

### Customization

#### Styling
- Modify `tailwind.config.ts` for theme colors
- Update CSS variables in `globals.css`
- Customize fonts and typography

#### Game Content
- Edit `case_01.json` for suspects, clues, and dialogue
- Update ESL learning objectives and grammar points
- Modify mini-game difficulty and content

#### Features
- Add new scene types in `game/scenes/`
- Implement additional mini-game types
- Extend teacher control capabilities
- Add new UI components

## 📊 Analytics & Monitoring

### Plausible Analytics
- **Privacy-focused**: No cookies or personal data collection
- **Metrics**: Page views, unique visitors, session duration
- **Goals**: Track game completions and teacher usage
- **Real-time**: Live visitor monitoring

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Game Performance**: Frame rate, loading times
- **Error Tracking**: Console errors and crashes
- **User Experience**: PWA install rates, offline usage

## 🔒 Security & Privacy

### Data Protection
- **Minimal Data**: Only game state and anonymous interactions stored
- **Ephemeral Sessions**: Room data automatically cleaned up
- **No Personal Info**: No names, emails, or identifiable data required
- **GDPR Compliant**: Privacy-first analytics and data handling

### Security Measures
- **RLS Policies**: Database-level access control
- **Anonymous Auth**: No account creation required
- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: Supabase built-in protection

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Submit pull request with description

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Auto-formatting on save
- **Commit Messages**: Conventional commits preferred

### Testing
- **Unit Tests**: Components and utilities
- **Integration Tests**: Game flow and real-time features
- **E2E Tests**: Complete teacher-student scenarios
- **Performance Tests**: Loading times and responsiveness

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

#### Game Won't Load
- Check browser console for errors
- Verify Supabase environment variables
- Ensure WebGL support is enabled

#### Real-time Sync Problems
- Confirm Realtime is enabled in Supabase
- Check network connectivity
- Verify RLS policies are correct

#### Performance Issues
- Ensure assets are properly compressed
- Check service worker caching
- Monitor console for memory leaks

### Getting Help
- **Documentation**: Comprehensive guides in `/docs`
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Community Q&A in GitHub Discussions
- **Email**: Support team contact information

---

**Happy Teaching and Learning!** 🕵️‍♀️📚

*Murder on the Bullet Express - Where mystery meets education aboard the most luxurious train in gaming.*