import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { modernDb } from '../services/modernDatabase';
import { soundEffects } from '../services/soundEffects';
import {
  User,
  Post,
  Task,
  Channel,
  ChatMessage,
  Meeting,
  DocumentItem,
  NotificationItem,
  AuditLog,
  ThemeSettings,
  TaskStatus,
  UserRole,
  AvailabilityStatus,
  StickerData,
  WorkspaceInfo,
  TaskCheckpoint,
  TaskReportItem,
  CreativeBriefFormat,
  VideoDraftScene,
  SlideDraftItem,
  PosterDraftItem,
  TaskApproval,
  TaskApprovalRequest,
  ActiveHuddle,
  HuddleParticipant,
  BrandDriveFolder,
  Attachment,
  DivisionItem,
  LeaveRequest,
  LeaveApproval,
  LeaveType,
  DivisionTaskRequest,
  PendingUserApproval
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_TASKS,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
  INITIAL_MEETINGS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WORKSPACE_INFO,
  INITIAL_BRAND_DRIVE_FOLDERS,
  INITIAL_DIVISIONS,
  INITIAL_DIVISION_REQUESTS
} from '../data/mockData';

interface WorkspaceContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;

  // Workspace Info & Customization
  workspaceInfo: WorkspaceInfo;
  updateWorkspaceInfo: (info: Partial<WorkspaceInfo>) => void;

  // Auth & Session
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  registerUser: (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    position: string;
    role: UserRole;
    avatar?: string;
  }) => User;
  updateUser: (userId: string, updates: Partial<User>) => void;

  // Right Side Notification Drawer
  isRightNotificationOpen: boolean;
  setIsRightNotificationOpen: (open: boolean) => void;
  toggleRightNotifications: () => void;
  
  // Feed
  posts: Post[];
  createPost: (post: Omit<Post, 'id' | 'likes' | 'bookmarks' | 'reposts' | 'comments' | 'createdAt'>) => void;
  likePost: (postId: string) => void;
  bookmarkPost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  togglePinPost: (postId: string) => void;
  deletePost: (postId: string) => void;

  // Tasks with Group Access Control, Checkpoints & Reports
  tasks: Task[];
  selectedTaskGroup: string;
  setSelectedTaskGroup: (group: string) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>) => void;
  updateTask: (task: Task) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  toggleTaskCheckpoint: (taskId: string, checkpointId: string) => void;
  addTaskCheckpoint: (taskId: string, title: string, targetDate?: string) => void;
  addTaskReport: (taskId: string, report: { type: 'progress_update' | 'blocker' | 'note'; content: string }) => void;
  addTaskComment: (taskId: string, content: string) => void;
  deleteTask: (taskId: string) => void;
  updateTaskBriefFormat: (taskId: string, format: CreativeBriefFormat) => void;
  updateTaskVideoDraft: (taskId: string, scenes: VideoDraftScene[]) => void;
  updateTaskSlideDraft: (taskId: string, slides: SlideDraftItem[]) => void;
  updateTaskPosterDraft: (taskId: string, poster: PosterDraftItem) => void;
  sendTaskForApproval: (taskId: string, targetChannelId: string, managerIds: string[], notes?: string) => void;
  processTaskApproval: (taskId: string, managerId: string, decision: 'approved' | 'declined', comment?: string) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;

  // Huddle (Voice & Video Call)
  activeHuddle: ActiveHuddle | null;
  startHuddle: (title: string, type: 'channel' | 'direct' | 'division', targetId: string, isVoiceOnly?: boolean) => void;
  endHuddle: () => void;
  toggleHuddleMinimize: () => void;
  toggleHuddleMic: () => void;
  toggleHuddleVideo: () => void;
  toggleHuddleScreenShare: () => void;
  sendHuddleReaction: (emoji: string) => void;

  // Chat & Group Settings
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  markChannelAsRead: (channelId: string) => void;
  messages: Record<string, ChatMessage[]>;
  sendMessage: (
    channelId: string,
    content: string,
    attachments?: Attachment[],
    voiceNote?: { duration: string; url: string },
    sticker?: StickerData,
    extra?: { imageUrl?: string; attachedTask?: Task; leaveRequest?: LeaveRequest }
  ) => void;
  toggleReaction: (channelId: string, messageId: string, emoji: string) => void;
  createChannel: (name: string, description: string, isPrivate: boolean, memberIds: string[], dept?: string) => void;
  updateChannelSettings: (channelId: string, updates: Partial<Channel>) => void;
  toggleStarChannel: (channelId: string) => void;
  togglePinMessage: (channelId: string, messageId: string) => void;
  toggleStarMessage: (channelId: string, messageId: string) => void;
  startDirectMessage: (targetUserId: string) => void;

  // Leave Request & Approval
  submitLeaveRequest: (
    channelId: string,
    leaveData: Omit<LeaveRequest, 'id' | 'createdAt' | 'bossApproval' | 'hrApproval' | 'overallStatus'>,
    bossUser: User,
    hrUser: User
  ) => void;
  processLeaveApproval: (
    channelId: string,
    messageId: string,
    approverRole: 'boss' | 'hr',
    decision: 'approved' | 'declined',
    comment?: string
  ) => void;
  leaveApprovalToast: string | null;
  setLeaveApprovalToast: (msg: string | null) => void;

  // Meetings
  meetings: Meeting[];
  createMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'actionItems'> & { actionItemsText?: string[] }) => void;
  updateMeeting: (meeting: Meeting) => void;
  convertActionItemToTask: (meetingId: string, actionItemId: string) => void;
  deleteMeeting: (meetingId: string) => void;

  // Documents
  documents: DocumentItem[];
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'downloadsCount' | 'isStarred'>) => void;
  deleteDocument: (documentId: string) => void;
  toggleStarDoc: (documentId: string) => void;
  recordDocDownload: (documentId: string) => void;

  // Brand Google Drive Directory
  brandDriveFolders: BrandDriveFolder[];
  addBrandDriveFolder: (folder: Omit<BrandDriveFolder, 'id' | 'lastUpdated'>) => void;
  updateBrandDriveFolder: (folder: BrandDriveFolder) => void;
  deleteBrandDriveFolder: (id: string) => void;
  toggleStarBrandDriveFolder: (id: string) => void;

  // Divisions Management
  divisions: DivisionItem[];
  addDivision: (division: Omit<DivisionItem, 'id'>) => void;
  deleteDivision: (id: string) => void;
  updateDivision: (division: DivisionItem) => void;

  // Notifications
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;

  // Directory & Admin
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserStatus: (status: AvailabilityStatus) => void;
  deleteUser: (userId: string) => void;
  inviteUser: (userData: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    position: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
  }) => User;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, resource: string, details: string) => void;

  // Quick Search & Modals
  isQuickSearchOpen: boolean;
  setIsQuickSearchOpen: (open: boolean) => void;
  quickActionModal: string | null;
  setQuickActionModal: (type: string | null) => void;
  resetAllData: () => void;

  // Modern Database Hub
  isDbHubOpen: boolean;
  setIsDbHubOpen: (open: boolean) => void;
  resetToInitialCorporateData: () => void;

  // Audio Ringtones & Chimes
  isSoundMuted: boolean;
  toggleSound: () => void;
  setSoundMuted: (muted: boolean) => void;
  playTestSound: (type: 'notification' | 'chat' | 'phone' | 'task') => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;

  // Cross-Division Task Requests (Permintaan Tugas Antar Divisi)
  divisionRequests: DivisionTaskRequest[];
  createDivisionRequest: (data: Omit<DivisionTaskRequest, 'id' | 'createdAt' | 'status'>) => void;
  acceptDivisionRequest: (requestId: string) => void;
  declineDivisionRequest: (requestId: string, reason?: string) => void;

  // External Email Approvals
  pendingApprovals: PendingUserApproval[];
  submitUserApprovalRequest: (data: { name: string; email: string; department: string; position: string; avatar?: string }) => void;
  approveUserRegistration: (id: string) => void;
  rejectUserRegistration: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'WORKSPACE_APP_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = loadFromStorage<User | null>('currentUser', null);
    if (saved) return saved;
    return INITIAL_USERS[0]; // Saeful Rohman default
  });

  const [activeTab, setActiveTabState] = useState<string>(() => loadFromStorage('activeTab', 'dashboard'));
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    let mode: 'light' | 'dark' = 'light';
    try {
      const explicit = localStorage.getItem('theme') || localStorage.getItem('WORKSPACE_THEME');
      if (explicit === 'dark' || explicit === 'light') {
        mode = explicit;
      } else {
        const savedSettings = loadFromStorage<Partial<ThemeSettings> | null>('themeSettings', null);
        if (savedSettings?.mode === 'dark' || savedSettings?.mode === 'light') {
          mode = savedSettings.mode;
        }
      }
    } catch {}
    const base = loadFromStorage('themeSettings', {
      accentColor: 'navy-crimson' as const,
      sidebarCollapsed: false,
      density: 'comfortable' as const,
      cardRadius: 'smooth' as const,
      bgPattern: 'clean' as const,
      customPrimaryColor: '#0f172a',
      customAccentColor: '#dc2626'
    });
    return {
      ...base,
      cardRadius: base.cardRadius || 'smooth',
      bgPattern: base.bgPattern || 'clean',
      mode
    };
  });

  const [posts, setPosts] = useState<Post[]>(() => loadFromStorage('posts', INITIAL_POSTS));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('tasks', INITIAL_TASKS));
  const [channels, setChannels] = useState<Channel[]>(() => loadFromStorage('channels', INITIAL_CHANNELS));
  const [activeChannelId, setActiveChannelIdState] = useState<string>(() => loadFromStorage('activeChannelId', 'chn_general'));

  const markChannelAsRead = (channelId: string) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId && c.unreadCount ? { ...c, unreadCount: 0 } : c))
    );
  };

  const setActiveChannelId = (id: string) => {
    setActiveChannelIdState(id);
    markChannelAsRead(id);
  };

  // Automatically clear unread count for the active channel
  useEffect(() => {
    if (activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
  }, [activeChannelId]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => loadFromStorage('messages', INITIAL_MESSAGES));
  const [meetings, setMeetings] = useState<Meeting[]>(() => loadFromStorage('meetings', INITIAL_MEETINGS));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadFromStorage('documents', INITIAL_DOCUMENTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS));

  // Workspace Info Customization State
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo>(() => loadFromStorage('workspaceInfo', INITIAL_WORKSPACE_INFO));
  
  // Authentication & Session - Default false so users must register/login with Google first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadFromStorage('isAuthenticated', false));
  
  // Right side notification drawer toggle state - default true so it stays visible persistently
  const [isRightNotificationOpen, setIsRightNotificationOpen] = useState<boolean>(() => loadFromStorage('isRightNotificationOpen', true));

  // Task group partition state
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string>(() => loadFromStorage('selectedTaskGroup', 'all'));

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [isDbHubOpen, setIsDbHubOpen] = useState(false);

  // Active Live Huddle (Voice & Video)
  const [activeHuddle, setActiveHuddle] = useState<ActiveHuddle | null>(null);

  // Brand Google Drive Master Directories
  const [brandDriveFolders, setBrandDriveFolders] = useState<BrandDriveFolder[]>(() => loadFromStorage('brandDriveFolders', INITIAL_BRAND_DRIVE_FOLDERS));

  // Dynamic Divisions State
  const [divisions, setDivisions] = useState<DivisionItem[]>(() => loadFromStorage('divisions', INITIAL_DIVISIONS));

  // Cross-Division Task Requests State
  const [divisionRequests, setDivisionRequests] = useState<DivisionTaskRequest[]>(() =>
    loadFromStorage('divisionRequests', INITIAL_DIVISION_REQUESTS)
  );

  // External Email Approvals State
  const [pendingApprovals, setPendingApprovals] = useState<PendingUserApproval[]>(() =>
    loadFromStorage('pendingApprovals', [
      {
        id: 'pa_1',
        name: 'Rahmat Hidayat',
        email: 'rahmat.external@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80',
        department: 'Technology & Engineering',
        position: 'External QA Engineer',
        requestedAt: new Date().toISOString(),
        status: 'pending'
      }
    ])
  );

  useEffect(() => {
    saveToStorage('pendingApprovals', pendingApprovals);
  }, [pendingApprovals]);

  const submitUserApprovalRequest = (data: { name: string; email: string; department: string; position: string; avatar?: string }) => {
    const newReq: PendingUserApproval = {
      id: 'pa_' + Date.now(),
      name: data.name,
      email: data.email,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      department: data.department,
      position: data.position,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    setPendingApprovals(prev => [newReq, ...prev]);

    // Send notification to Super Admin
    const superAdmin = users.find(u => u.role === 'super_admin') || users[0];
    if (superAdmin) {
      const newNotif: NotificationItem = {
        id: 'notif_' + Date.now(),
        recipientId: superAdmin.id,
        senderName: data.name,
        senderAvatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
        type: 'system',
        title: 'Permohonan Akses Akun Baru',
        message: `${data.name} (${data.email}) meminta akses ke workspace. Silakan setujui di Panel Admin.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    addAuditLog('USER_APPROVAL_REQUEST', 'Authentication', `Permohonan akses akun eksternal dari ${data.email} dikirim ke Super Admin`);
  };

  const approveUserRegistration = (id: string) => {
    const req = pendingApprovals.find(p => p.id === id);
    if (!req) return;
    const newUser: User = {
      id: 'usr_ext_' + Date.now(),
      name: req.name,
      email: req.email,
      avatar: req.avatar,
      role: 'employee',
      department: req.department,
      position: req.position,
      phone: '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: 'Remote / External Hub',
      status: 'online',
      joinedDate: new Date().toISOString().split('T')[0],
      employeeId: 'EMP-' + Math.floor(2026000 + Math.random() * 9000),
      employmentType: 'Contract',
      gender: 'Laki-laki',
      birthDate: '1993-05-14'
    };
    setUsers(prev => [newUser, ...prev]);
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    addAuditLog('USER_APPROVAL_ACCEPT', 'Authentication', `Super Admin menyetujui akses akun ${req.email}`);
  };

  const rejectUserRegistration = (id: string) => {
    const req = pendingApprovals.find(p => p.id === id);
    if (!req) return;
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    addAuditLog('USER_APPROVAL_REJECT', 'Authentication', `Super Admin menolak akses akun ${req.email}`);
  };

  // Audio Ringtones & Chimes Mute State
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEffects.getIsMuted());

  // Global Leave Request Approval Toast
  const [leaveApprovalToast, setLeaveApprovalToast] = useState<string | null>(null);

  // Sync state to localStorage & modern IndexedDB Engine
  useEffect(() => {
    saveToStorage('divisionRequests', divisionRequests);
  }, [divisionRequests]);

  useEffect(() => { 
    saveToStorage('divisions', divisions); 
    modernDb.saveBatch('divisions', divisions);
  }, [divisions]);

  useEffect(() => { 
    saveToStorage('brandDriveFolders', brandDriveFolders); 
    modernDb.saveBatch('brandDriveFolders', brandDriveFolders);
  }, [brandDriveFolders]);

  useEffect(() => { 
    saveToStorage('users', users); 
    modernDb.saveBatch('users', users);
  }, [users]);

  useEffect(() => { saveToStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('activeTab', activeTab); }, [activeTab]);
  useEffect(() => { saveToStorage('themeSettings', themeSettings); }, [themeSettings]);
  useEffect(() => { saveToStorage('workspaceInfo', workspaceInfo); }, [workspaceInfo]);
  useEffect(() => { saveToStorage('isAuthenticated', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { saveToStorage('selectedTaskGroup', selectedTaskGroup); }, [selectedTaskGroup]);

  useEffect(() => { 
    saveToStorage('posts', posts); 
    modernDb.saveBatch('posts', posts);
  }, [posts]);

  useEffect(() => { 
    saveToStorage('tasks', tasks); 
    modernDb.saveBatch('tasks', tasks);
  }, [tasks]);

  useEffect(() => { 
    saveToStorage('channels', channels); 
    modernDb.saveBatch('channels', channels);
  }, [channels]);

  useEffect(() => { saveToStorage('activeChannelId', activeChannelId); }, [activeChannelId]);
  useEffect(() => { saveToStorage('messages', messages); }, [messages]);

  useEffect(() => { 
    saveToStorage('meetings', meetings); 
    modernDb.saveBatch('meetings', meetings);
  }, [meetings]);

  useEffect(() => { 
    saveToStorage('documents', documents); 
    modernDb.saveBatch('documents', documents);
  }, [documents]);

  useEffect(() => { 
    saveToStorage('notifications', notifications); 
    modernDb.saveBatch('notifications', notifications);
  }, [notifications]);

  useEffect(() => { 
    saveToStorage('auditLogs', auditLogs); 
    modernDb.saveBatch('auditLogs', auditLogs);
  }, [auditLogs]);

  useEffect(() => { saveToStorage('isRightNotificationOpen', isRightNotificationOpen); }, [isRightNotificationOpen]);

  // Sync dark mode class on HTML document and body, attribute, and localStorage keys
  useEffect(() => {
    const isDark = themeSettings.mode === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('theme', themeSettings.mode);
      localStorage.setItem('WORKSPACE_THEME', themeSettings.mode);
    } catch {}
  }, [themeSettings.mode]);

  // Apply theme shapes, background patterns, and custom colors
  useEffect(() => {
    const root = document.documentElement;
    const radiusMap: Record<string, string> = {
      sharp: '8px',
      rounded: '16px',
      smooth: '24px',
      pill: '36px'
    };
    root.style.setProperty('--ui-radius', radiusMap[themeSettings.cardRadius || 'smooth'] || '24px');

    const PRESET_COLORS: Record<string, { primary: string; accent: string }> = {
      'navy-crimson': { primary: '#0f172a', accent: '#dc2626' },
      'royal-blue': { primary: '#1e3a8a', accent: '#2563eb' },
      'emerald': { primary: '#064e3b', accent: '#059669' },
      'purple': { primary: '#3b0764', accent: '#9333ea' },
      'amber': { primary: '#451a03', accent: '#f59e0b' }
    };

    const preset = PRESET_COLORS[themeSettings.accentColor] || PRESET_COLORS['navy-crimson'];
    root.style.setProperty('--primary-color', themeSettings.customPrimaryColor || preset.primary);
    root.style.setProperty('--accent-color', themeSettings.customAccentColor || preset.accent);

    // Chat bubble color application
    const BUBBLE_COLORS: Record<string, string> = {
      red: '#dc2626',
      blue: '#2563eb',
      emerald: '#059669',
      purple: '#7c3aed',
      amber: '#d97706',
      navy: '#0f172a'
    };

    const bubbleBg = themeSettings.chatBubbleColor === 'custom' && themeSettings.customChatBubbleColor
      ? themeSettings.customChatBubbleColor
      : (BUBBLE_COLORS[themeSettings.chatBubbleColor || 'red'] || '#dc2626');
    root.style.setProperty('--chat-bubble-bg', bubbleBg);

    // Dynamic Font Size Scaling (Small - Normal - Large)
    const FONT_SCALES: Record<string, string> = {
      small: '14.5px',
      normal: '16.5px',
      large: '18.5px'
    };
    const activeFontSize = FONT_SCALES[themeSettings.fontSize || 'normal'] || '16.5px';
    root.style.setProperty('--app-font-size', activeFontSize);
    document.documentElement.style.fontSize = activeFontSize;

    // Dynamic Button Hover, Selector Active, and Icon Accent Colors
    if (themeSettings.buttonHoverColor) {
      root.style.setProperty('--btn-hover-color', themeSettings.buttonHoverColor);
    } else {
      root.style.removeProperty('--btn-hover-color');
    }
    if (themeSettings.selectorActiveColor) {
      root.style.setProperty('--selector-active-color', themeSettings.selectorActiveColor);
    } else {
      root.style.removeProperty('--selector-active-color');
    }
    if (themeSettings.iconAccentColor) {
      root.style.setProperty('--icon-accent-color', themeSettings.iconAccentColor);
    } else {
      root.style.removeProperty('--icon-accent-color');
    }

    const patternClasses = ['bg-pattern-clean', 'bg-pattern-dots', 'bg-pattern-mesh', 'bg-pattern-grid', 'bg-pattern-aurora'];
    patternClasses.forEach(cls => {
      document.body.classList.remove(cls);
      document.documentElement.classList.remove(cls);
    });
    if (themeSettings.bgPattern && themeSettings.bgPattern !== 'clean') {
      document.body.classList.add(`bg-pattern-${themeSettings.bgPattern}`);
      document.documentElement.classList.add(`bg-pattern-${themeSettings.bgPattern}`);
    }

    saveToStorage('themeSettings', themeSettings);
  }, [
    themeSettings.cardRadius,
    themeSettings.bgPattern,
    themeSettings.accentColor,
    themeSettings.customPrimaryColor,
    themeSettings.customAccentColor,
    themeSettings.chatBubbleColor,
    themeSettings.customChatBubbleColor,
    themeSettings.fontSize,
    themeSettings.buttonHoverColor,
    themeSettings.selectorActiveColor,
    themeSettings.iconAccentColor
  ]);

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeSettings(prev => {
      const next = { ...prev, mode };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  const toggleTheme = () => {
    setThemeSettings(prev => {
      const next = {
        ...prev,
        mode: (prev.mode === 'dark' ? 'light' : 'dark') as 'light' | 'dark'
      };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => {
      const next = { ...prev, ...newSettings };
      saveToStorage('themeSettings', next);
      return next;
    });
  };

  // Division Actions
  const addDivision = (divData: Omit<DivisionItem, 'id'>) => {
    const newDiv: DivisionItem = {
      ...divData,
      id: 'div_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDivisions(prev => [...prev, newDiv]);
    addAuditLog('DIVISION_CREATE', 'Division Hub', `Menambahkan divisi baru: "${newDiv.name}"`);
  };

  const deleteDivision = (id: string) => {
    setDivisions(prev => prev.filter(d => d.id !== id));
    addAuditLog('DIVISION_DELETE', 'Division Hub', `Menghapus divisi ${id}`);
  };

  const updateDivision = (updated: DivisionItem) => {
    setDivisions(prev => prev.map(d => d.id === updated.id ? updated : d));
    addAuditLog('DIVISION_UPDATE', 'Division Hub', `Memperbarui divisi: "${updated.name}"`);
  };

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (tab === 'notifications') {
      setNotifications(items => items.map(n => ({ ...n, read: true })));
    }
    if (tab === 'chat' && activeChannelId) {
      markChannelAsRead(activeChannelId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addAuditLog = (action: string, resource: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      resource,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '10.240.12.8 (Internal HQ)'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    addAuditLog('USER_SWITCH_CONTEXT', 'User Session', `Beralih profil ke ${user.name} (${user.role})`);
  };

  // FEED ACTIONS
  const createPost = (newPostData: Omit<Post, 'id' | 'likes' | 'bookmarks' | 'reposts' | 'comments' | 'createdAt'>) => {
    const newPost: Post = {
      ...newPostData,
      id: 'post_' + Date.now(),
      likes: [],
      bookmarks: [],
      reposts: [],
      comments: [],
      createdAt: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
    addAuditLog('POST_CREATE', 'Social Feed', `Mempublikasikan kiriman baru: "${newPost.content.substring(0, 40)}..."`);
  };

  const likePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const hasLiked = p.likes.includes(currentUser.id);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id]
        };
      })
    );
  };

  const bookmarkPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const hasBookmarked = p.bookmarks.includes(currentUser.id);
        return {
          ...p,
          bookmarks: hasBookmarked ? p.bookmarks.filter(id => id !== currentUser.id) : [...p.bookmarks, currentUser.id]
        };
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const commentObj = {
      id: 'comm_' + Date.now(),
      postId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.position,
      content,
      createdAt: new Date().toISOString(),
      likes: []
    };
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, commentObj] } : p))
    );
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId || !p.pollOptions) return p;
        const updatedOptions = p.pollOptions.map(opt => {
          const filtered = opt.votes.filter(uid => uid !== currentUser.id);
          if (opt.id === optionId) {
            return { ...opt, votes: [...filtered, currentUser.id] };
          }
          return { ...opt, votes: filtered };
        });
        return { ...p, pollOptions: updatedOptions };
      })
    );
  };

  const togglePinPost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p))
    );
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // TASK ACTIONS
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'activity'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'tsk_' + Date.now(),
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Membuat task baru',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    soundEffects.playNewTaskSound();
    addAuditLog('TASK_CREATE', 'Kanban Board', `Membuat task: "${newTask.title}"`);
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : t)));
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const isNowDone = newStatus === 'done';
        if (isNowDone && t.status !== 'done') {
          soundEffects.playNewTaskSound();
          // Trigger celebratory confetti!
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {
            // ignore
          }
        }
        return {
          ...t,
          status: newStatus,
          completedAt: isNowDone ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
          activity: [
            {
              id: 'act_' + Date.now(),
              userId: currentUser.id,
              userName: currentUser.name,
              action: `Mengubah status ke ${newStatus.toUpperCase()}`,
              timestamp: new Date().toISOString()
            },
            ...t.activity
          ]
        };
      })
    );
    addAuditLog('TASK_MOVE', 'Kanban Board', `Task ${taskId} diubah status menjadi ${newStatus}`);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newChecklists = t.checklists.map(c =>
          c.id === itemId ? { ...c, completed: !c.completed } : c
        );
        return {
          ...t,
          checklists: newChecklists,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    if (!content.trim()) return;
    const commentObj = {
      id: 'tc_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toISOString()
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          comments: [...t.comments, commentObj],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    addAuditLog('TASK_DELETE', 'Kanban Board', `Menghapus task ${taskId}`);
  };

  const toggleTaskCheckpoint = (taskId: string, checkpointId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const currentCheckpoints = t.checkpoints || [];
        const updated = currentCheckpoints.map(cp => {
          if (cp.id !== checkpointId) return cp;
          const isDone = !cp.isCompleted;
          return {
            ...cp,
            isCompleted: isDone,
            completedAt: isDone ? new Date().toISOString() : undefined
          };
        });
        return {
          ...t,
          checkpoints: updated,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskCheckpoint = (taskId: string, title: string, targetDate?: string) => {
    if (!title.trim()) return;
    const newCheckpoint: TaskCheckpoint = {
      id: 'cp_' + Date.now(),
      title: title.trim(),
      isCompleted: false,
      targetDate
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          checkpoints: [...(t.checkpoints || []), newCheckpoint],
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addTaskReport = (taskId: string, report: { type: 'progress_update' | 'blocker' | 'note'; content: string }) => {
    if (!report.content.trim()) return;
    const newReport: TaskReportItem = {
      id: 'rep_' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      type: report.type,
      content: report.content.trim(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          reports: [newReport, ...(t.reports || [])],
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_REPORT', 'Task Progress', `Menambahkan laporan/catatan pada task: ${taskId}`);
  };

  const updateTaskVideoDraft = (taskId: string, scenes: VideoDraftScene[]) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          videoDraftScenes: scenes,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Video Storyboard', `Memperbarui draft storyboard video (${scenes.length} scene)`);
  };

  const updateTaskBriefFormat = (taskId: string, format: CreativeBriefFormat) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          briefFormat: format,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Creative Brief', `Mengubah format brief card menjadi: ${format}`);
  };

  const updateTaskSlideDraft = (taskId: string, slides: SlideDraftItem[]) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          slideDraftItems: slides,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Slide Draft', `Memperbarui draft slide presentasi/carousel (${slides.length} slide)`);
  };

  const updateTaskPosterDraft = (taskId: string, poster: PosterDraftItem) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          posterDraftItem: poster,
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditLog('TASK_UPDATE', 'Poster Draft', `Memperbarui brief poster single key visual`);
  };

  const sendTaskForApproval = (taskId: string, targetChannelId: string, managerIds: string[], notes?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const targetChan = channels.find(c => c.id === targetChannelId);
    const managerApprovals: TaskApproval[] = managerIds.map(mId => {
      const mgr = users.find(u => u.id === mId);
      return {
        id: 'app_' + Date.now() + '_' + mId,
        managerId: mId,
        managerName: mgr?.name || 'Manager',
        managerRole: mgr?.role || 'Manager',
        managerAvatar: mgr?.avatar || '',
        status: 'pending'
      };
    });

    const approvalReq: TaskApprovalRequest = {
      targetChannelId,
      targetChannelName: targetChan ? (targetChan.type === 'channel' ? `#${targetChan.name}` : targetChan.name) : 'Group Divisi',
      targetGroupId: targetTask.groupId,
      requestedAt: new Date().toISOString(),
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      status: 'pending',
      requiredApprovals: managerApprovals
    };

    const updatedTask: Task = {
      ...targetTask,
      status: 'on_review',
      approvalRequest: approvalReq,
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Mengajukan approval ke ${approvalReq.targetChannelName} (${managerApprovals.map(m => m.managerName).join(', ')})`,
          timestamp: new Date().toISOString()
        },
        ...targetTask.activity
      ],
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => (t.id === taskId ? updatedTask : t)));

    if (targetChannelId) {
      const messageContent = notes?.trim()
        ? notes.trim()
        : `Mohon review dan persetujuan untuk tugas: "${targetTask.title}"`;

      sendMessage(
        targetChannelId,
        messageContent,
        undefined,
        undefined,
        undefined,
        { attachedTask: updatedTask }
      );
    }

    addAuditLog('APPROVAL_REQUEST', 'Task Management', `Mengirimkan tugas "${targetTask.title}" untuk approval Manager`);
  };

  const processTaskApproval = (taskId: string, managerId: string, decision: 'approved' | 'declined', comment?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || !targetTask.approvalRequest) return;

    const manager = users.find(u => u.id === managerId) || currentUser;
    const currentApprovals = targetTask.approvalRequest.requiredApprovals.map(app => {
      if (app.managerId === managerId || (currentUser.role === 'super_admin' && app.status === 'pending')) {
        return {
          ...app,
          status: decision,
          comment: comment || (decision === 'approved' ? 'Disetujui' : 'Perlu revisi'),
          timestamp: new Date().toISOString()
        };
      }
      return app;
    });

    const allApproved = currentApprovals.every(a => a.status === 'approved');
    const isDeclined = decision === 'declined';

    const newStatus: TaskStatus = allApproved ? 'done' : isDeclined ? 'on_progress' : 'on_review';
    const newApprovalStatus = allApproved ? 'approved' : isDeclined ? 'declined' : 'pending';

    if (allApproved) {
      try {
        confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });
      } catch {}
    }

    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: newStatus,
          completedAt: allApproved ? new Date().toISOString() : undefined,
          approvalRequest: {
            ...t.approvalRequest!,
            status: newApprovalStatus,
            requiredApprovals: currentApprovals
          },
          activity: [
            {
              id: 'act_' + Date.now(),
              userId: currentUser.id,
              userName: currentUser.name,
              action: `${decision === 'approved' ? 'Menyetujui' : 'Menolak'} approval task (${manager.name}): ${comment || ''}`,
              timestamp: new Date().toISOString()
            },
            ...t.activity
          ],
          updatedAt: new Date().toISOString()
        };
      })
    );

    if (targetTask.approvalRequest.targetChannelId) {
      if (allApproved) {
        sendMessage(
          targetTask.approvalRequest.targetChannelId,
          `🎉 **TASK TELAH DISETUJUI & SELESAI (DONE)!**\n\nTugas: **${targetTask.title}**\nSeluruh Manager telah memberikan persetujuan. Kartu tugas secara otomatis dipindahkan ke kolom **Done / Selesai**.`
        );
      } else if (isDeclined) {
        sendMessage(
          targetTask.approvalRequest.targetChannelId,
          `⚠️ **APPROVAL DITOLAK / PERLU REVISI**\n\nTugas: **${targetTask.title}**\nDitolak oleh: **${manager.name}**\nAlasan: "${comment || 'Perlu perbaikan sebelum approval disetujui.'}"\nStatus tugas dikembalikan ke **On Progress**.`
        );
      }
    }

    addAuditLog(
      decision === 'approved' ? 'APPROVAL_GRANTED' : 'APPROVAL_DECLINED',
      'Task Management',
      `${manager.name} ${decision === 'approved' ? 'menyetujui' : 'menolak'} tugas "${targetTask.title}"`
    );
  };

  const archiveTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId
          ? { ...t, isArchived: true, archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage('tasks', updated);
      return updated;
    });
    addAuditLog('TASK_ARCHIVE', 'Task Management', `Mengarsipkan tugas: ${taskId}`);
  };

  const unarchiveTask = (taskId: string) => {
    setTasks(prev => {
      const updated = prev.map(t =>
        t.id === taskId
          ? { ...t, isArchived: false, archivedAt: undefined, updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage('tasks', updated);
      return updated;
    });
    addAuditLog('TASK_UNARCHIVE', 'Task Management', `Memulihkan tugas dari arsip: ${taskId}`);
  };

  // Automatic Archive: Done tasks older than 7 days (1 week) are automatically archived
  useEffect(() => {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    let hasChanges = false;

    const nextTasks = tasks.map(t => {
      if (t.status === 'done' && !t.isArchived) {
        const completedTime = t.completedAt
          ? new Date(t.completedAt).getTime()
          : new Date(t.updatedAt || t.createdAt).getTime();

        if (now - completedTime >= ONE_WEEK_MS) {
          hasChanges = true;
          return {
            ...t,
            isArchived: true,
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      return t;
    });

    if (hasChanges) {
      setTasks(nextTasks);
      saveToStorage('tasks', nextTasks);
    }
  }, [tasks]);

  // HUDDLE ACTIONS (Voice & Video)
  const startHuddle = (title: string, type: 'channel' | 'direct' | 'division', targetId: string, isVoiceOnly: boolean = false) => {
    const otherUsers = users.filter(u => u.id !== currentUser.id).slice(0, 3);
    const participants: HuddleParticipant[] = [
      {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.position || currentUser.role,
        isMuted: false,
        isVideoOn: !isVoiceOnly,
        isSpeaking: true,
        isScreenSharing: false
      },
      ...otherUsers.map((u, i) => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        role: u.position || u.role,
        isMuted: i > 0,
        isVideoOn: !isVoiceOnly && i === 0,
        isSpeaking: i === 0,
        isScreenSharing: false
      }))
    ];

    setActiveHuddle({
      id: 'hud_' + Date.now(),
      title,
      type,
      targetId,
      startedAt: new Date().toISOString(),
      participants,
      isMinimized: false,
      isVoiceOnly
    });

    soundEffects.playPhoneRingSound(12);
    addAuditLog('HUDDLE_START', 'Live Huddle', `Memulai huddle ${isVoiceOnly ? 'suara' : 'video'} di ${title}`);
  };

  const endHuddle = () => {
    soundEffects.stopPhoneRingSound();
    setActiveHuddle(null);
    addAuditLog('HUDDLE_END', 'Live Huddle', `Mengakhiri sesi huddle`);
  };

  const toggleHuddleMinimize = () => {
    setActiveHuddle(prev => (prev ? { ...prev, isMinimized: !prev.isMinimized } : null));
  };

  const toggleHuddleMic = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isMuted: !p.isMuted, isSpeaking: p.isMuted } : p
        )
      };
    });
  };

  const toggleHuddleVideo = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isVideoOn: !p.isVideoOn } : p
        )
      };
    });
  };

  const toggleHuddleScreenShare = () => {
    setActiveHuddle(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p =>
          p.id === currentUser.id ? { ...p, isScreenSharing: !p.isScreenSharing } : p
        )
      };
    });
  };

  const sendHuddleReaction = (emoji: string) => {
    // emoji event broadcasted to active room
  };

  const updateWorkspaceInfo = (info: Partial<WorkspaceInfo>) => {
    if (currentUser.role !== 'super_admin') {
      console.warn('Hanya Super Admin yang berwenang mengubah konfigurasi workspace.');
      return;
    }
    setWorkspaceInfo(prev => ({ ...prev, ...info }));
    addAuditLog('WORKSPACE_UPDATE', 'Pengaturan Workspace', `Memperbarui konfigurasi workspace`);
  };

  const login = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    addAuditLog('AUTH_LOGIN', 'Sesi Pengguna', `${user.name} berhasil login`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    addAuditLog('AUTH_LOGOUT', 'Sesi Pengguna', `${currentUser.name} keluar sistem`);
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    password?: string;
    department: string;
    position: string;
    role: UserRole;
    avatar?: string;
  }) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'employee',
      department: userData.department,
      position: userData.position,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      phone: '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: 'Headquarters - Jakarta',
      status: 'online',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthenticated(true);
    addAuditLog('USER_REGISTER', 'Pendaftaran Akun Baru', `User ${newUser.name} berhasil didaftarkan ke divisi ${newUser.department}`);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    return newUser;
  };

  const toggleRightNotifications = () => {
    setIsRightNotificationOpen(prev => {
      const next = !prev;
      if (next) {
        // When opening the notification center, mark all notifications as read so the badge clears
        setNotifications(items => items.map(n => ({ ...n, read: true })));
      }
      return next;
    });
  };

  // CHAT ACTIONS
  const sendMessage = (
    channelId: string,
    content: string,
    attachments?: Attachment[],
    voiceNote?: { duration: string; url: string },
    sticker?: StickerData,
    extra?: { imageUrl?: string; attachedTask?: Task; leaveRequest?: LeaveRequest }
  ) => {
    if (!content.trim() && !attachments?.length && !voiceNote && !sticker && !extra?.imageUrl && !extra?.attachedTask && !extra?.leaveRequest) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      channelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      reactions: [],
      attachments,
      voiceNote,
      sticker,
      imageUrl: extra?.imageUrl,
      attachedTask: extra?.attachedTask,
      leaveRequest: extra?.leaveRequest
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMsg]
    }));
    soundEffects.playChatSound();

    // Update last message in channels
    setChannels(prev =>
      prev.map(c =>
        c.id === channelId
          ? {
              ...c,
              lastMessage: sticker
                ? `✨ Stiker: ${sticker.text || sticker.emoji}`
                : content || (voiceNote ? '🎤 Pesan suara' : '📎 Berkas lampiran'),
              lastMessageTime: 'Baru saja'
            }
          : c
      )
    );

    // Realistic auto-reply simulation for demo if chatting with someone else
    const targetChannel = channels.find(c => c.id === channelId);
    if (targetChannel && targetChannel.type === 'direct' && targetChannel.otherUserId) {
      const colleague = users.find(u => u.id === targetChannel.otherUserId);
      if (colleague && colleague.id !== currentUser.id) {
        setTimeout(() => {
          const autoReplies = [
            `Baik Pak ${currentUser.name}, saya catat dan langsung saya tindak lanjuti! 👍`,
            `Terima kasih infonya! Saya sedang meninjau dokumennya sekarang.`,
            `Noted Pak! Nanti saya update progresnya sebelum jam istirahat.`,
            `Siap Pak ${currentUser.name}, sinkronisasi datanya sudah aman di staging.`
          ];
          const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          const replyMsg: ChatMessage = {
            id: 'msg_reply_' + Date.now(),
            channelId,
            senderId: colleague.id,
            senderName: colleague.name,
            senderAvatar: colleague.avatar,
            content: randomReply,
            createdAt: new Date().toISOString(),
            reactions: [{ emoji: '👍', userIds: [currentUser.id] }]
          };
          setMessages(m => ({
            ...m,
            [channelId]: [...(m[channelId] || []), replyMsg]
          }));
          soundEffects.playChatSound();
        }, 1200);
      }
    }
  };

  const toggleReaction = (channelId: string, messageId: string, emoji: string) => {
    setMessages(prev => {
      const list = prev[channelId] || [];
      const updatedList = list.map(msg => {
        if (msg.id !== messageId) return msg;
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        let nextReactions = [...msg.reactions];
        if (existingReaction) {
          if (existingReaction.userIds.includes(currentUser.id)) {
            const newUserIds = existingReaction.userIds.filter(id => id !== currentUser.id);
            if (newUserIds.length === 0) {
              nextReactions = nextReactions.filter(r => r.emoji !== emoji);
            } else {
              nextReactions = nextReactions.map(r =>
                r.emoji === emoji ? { ...r, userIds: newUserIds } : r
              );
            }
          } else {
            nextReactions = nextReactions.map(r =>
              r.emoji === emoji ? { ...r, userIds: [...r.userIds, currentUser.id] } : r
            );
          }
        } else {
          nextReactions.push({ emoji, userIds: [currentUser.id] });
        }
        return { ...msg, reactions: nextReactions };
      });
      return { ...prev, [channelId]: updatedList };
    });
  };

  const createChannel = (name: string, description: string, isPrivate: boolean, memberIds: string[], dept?: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: 'chn_' + Date.now(),
      name: slug,
      type: 'channel',
      description,
      isPrivate,
      memberIds: [...new Set([...memberIds, currentUser.id])],
      dept,
      unreadCount: 0,
      lastMessage: 'Channel baru dibuat.',
      lastMessageTime: 'Baru saja'
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
    addAuditLog('CHANNEL_CREATE', 'Messaging', `Membuat channel #${slug}`);
  };

  const startDirectMessage = (targetUserId: string) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;
    const existingDm = channels.find(
      c => c.type === 'direct' && c.otherUserId === targetUserId
    );
    if (existingDm) {
      setActiveChannelId(existingDm.id);
      setActiveTab('chat');
    } else {
      const newDm: Channel = {
        id: 'dm_' + targetUserId + '_' + Date.now(),
        name: targetUser.name,
        type: 'direct',
        otherUserId: targetUserId,
        memberIds: [currentUser.id, targetUserId],
        unreadCount: 0,
        lastMessage: 'Memulai percakapan langsung...',
        lastMessageTime: 'Baru saja'
      };
      setChannels(prev => [newDm, ...prev]);
      setActiveChannelId(newDm.id);
      setActiveTab('chat');
    }
  };

  // LEAVE REQUEST & APPROVAL WORKFLOW
  const submitLeaveRequest = (
    channelId: string,
    leaveData: Omit<LeaveRequest, 'id' | 'createdAt' | 'bossApproval' | 'hrApproval' | 'overallStatus'>,
    bossUser: User,
    hrUser: User
  ) => {
    const leaveId = 'leave_' + Date.now();
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: leaveId,
      createdAt: new Date().toISOString(),
      bossApproval: {
        approverId: bossUser.id,
        approverName: bossUser.name,
        approverRole: 'boss',
        approverTitle: `${bossUser.position || 'Atasan Langsung'} (${bossUser.department})`,
        approverAvatar: bossUser.avatar,
        status: 'pending'
      },
      hrApproval: {
        approverId: hrUser.id,
        approverName: hrUser.name,
        approverRole: 'hr',
        approverTitle: `${hrUser.position || 'HR Director'} (Human Resources)`,
        approverAvatar: hrUser.avatar,
        status: 'pending'
      },
      overallStatus: 'pending'
    };

    const formattedMessage = `📋 **Form Pengajuan Izin Cuti**: ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari kerja) diajukan oleh **${leaveData.requesterName}** kepada Atasan (**${bossUser.name}**) dan HR (**${hrUser.name}**).`;

    sendMessage(
      channelId,
      formattedMessage,
      leaveData.attachmentUrl
        ? [
            {
              name: leaveData.attachmentName || 'Surat_Keterangan_Cuti.pdf',
              url: leaveData.attachmentUrl,
              type: 'document',
              size: '1.2 MB'
            }
          ]
        : undefined,
      undefined,
      undefined,
      { leaveRequest: newLeave }
    );

    // Add persistent notifications to Boss and HR
    const notifBoss: NotificationItem = {
      id: 'notif_leave_boss_' + Date.now(),
      recipientId: bossUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'leave_request',
      title: 'Pengajuan Cuti Baru',
      message: `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari). Menunggu persetujuan Anda.`,
      link: channelId,
      targetTab: 'chat',
      read: false,
      createdAt: new Date().toISOString()
    };

    const notifHR: NotificationItem = {
      id: 'notif_leave_hr_' + (Date.now() + 1),
      recipientId: hrUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'leave_request',
      title: 'Pengajuan Cuti Baru',
      message: `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari). Menunggu validasi HR.`,
      link: channelId,
      targetTab: 'chat',
      read: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [notifBoss, notifHR, ...prev]);
    setLeaveApprovalToast(`Pengajuan cuti ${leaveData.leaveTypeLabel} berhasil dikirim ke ${bossUser.name} (Atasan) & ${hrUser.name} (HR)!`);
    setTimeout(() => setLeaveApprovalToast(null), 4000);

    addAuditLog('LEAVE_REQUEST', 'Human Resources', `${currentUser.name} mengajukan ${leaveData.leaveTypeLabel} (${leaveData.totalDays} hari kerja)`);
  };

  const processLeaveApproval = (
    channelId: string,
    messageId: string,
    approverRole: 'boss' | 'hr',
    decision: 'approved' | 'declined',
    comment?: string
  ) => {
    let bothApproved = false;
    let requesterUser: { name: string; id: string; dates: string; type: string } | null = null;
    let bossName = '';
    let hrName = '';

    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      const updatedMsgs = channelMsgs.map(msg => {
        if (msg.id !== messageId || !msg.leaveRequest) return msg;

        const currentLeave = msg.leaveRequest;
        const nowIso = new Date().toISOString();

        const updatedBoss: LeaveApproval =
          approverRole === 'boss'
            ? {
                ...currentLeave.bossApproval,
                approverId: currentUser.id,
                approverName: currentUser.name,
                approverAvatar: currentUser.avatar,
                status: decision,
                comment: comment || (decision === 'approved' ? 'Disetujui oleh Atasan Langsung' : 'Ditolak oleh Atasan'),
                timestamp: nowIso
              }
            : currentLeave.bossApproval;

        const updatedHr: LeaveApproval =
          approverRole === 'hr'
            ? {
                ...currentLeave.hrApproval,
                approverId: currentUser.id,
                approverName: currentUser.name,
                approverAvatar: currentUser.avatar,
                status: decision,
                comment: comment || (decision === 'approved' ? 'Disetujui dan diverifikasi oleh Tim HR' : 'Ditolak oleh HR'),
                timestamp: nowIso
              }
            : currentLeave.hrApproval;

        bossName = updatedBoss.approverName;
        hrName = updatedHr.approverName;
        requesterUser = {
          name: currentLeave.requesterName,
          id: currentLeave.requesterId,
          dates: `${currentLeave.startDate} s/d ${currentLeave.endDate}`,
          type: currentLeave.leaveTypeLabel
        };

        const isBossAppr = updatedBoss.status === 'approved';
        const isHrAppr = updatedHr.status === 'approved';
        const isAnyDeclined = updatedBoss.status === 'declined' || updatedHr.status === 'declined';

        let newOverall: LeaveRequest['overallStatus'] = 'pending';
        if (isAnyDeclined) {
          newOverall = 'declined';
        } else if (isBossAppr && isHrAppr) {
          newOverall = 'fully_approved';
          bothApproved = true;
        } else if (isBossAppr) {
          newOverall = 'boss_approved';
        } else if (isHrAppr) {
          newOverall = 'hr_approved';
        }

        return {
          ...msg,
          leaveRequest: {
            ...currentLeave,
            bossApproval: updatedBoss,
            hrApproval: updatedHr,
            overallStatus: newOverall
          }
        };
      });

      return {
        ...prev,
        [channelId]: updatedMsgs
      };
    });

    // If both approved, trigger celebration effects and notifications
    if (bothApproved && requesterUser) {
      try {
        confetti({ particleCount: 90, spread: 85, origin: { y: 0.55 } });
      } catch {}

      const celebrationToastMsg = `🎉 CUTI TELAH DISETUJUI! Pengajuan cuti ${(requesterUser as any).name} (${(requesterUser as any).dates}) resmi disetujui penuh oleh Atasan (${bossName}) dan HR (${hrName}).`;
      setLeaveApprovalToast(celebrationToastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 8000);

      // Add persistent Notification
      const approvalNotif: NotificationItem = {
        id: 'notif_leave_approved_' + Date.now(),
        recipientId: (requesterUser as any).id,
        senderId: currentUser.id,
        senderName: 'Sistem HR & Atasan',
        type: 'leave_request',
        title: '🎉 Cuti Telah Disetujui!',
        message: `Pengajuan ${(requesterUser as any).type} Anda (${(requesterUser as any).dates}) telah DISETUJUI PENUH oleh Atasan (${bossName}) dan HR (${hrName}).`,
        link: channelId,
        targetTab: 'chat',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [approvalNotif, ...prev]);

      // System notification message into chat channel
      setTimeout(() => {
        sendMessage(
          channelId,
          `🎉 **NOTIFIKASI RESMI: CUTI TELAH DISETUJUI!**\n\nPengajuan cuti atas nama **${(requesterUser as any)?.name}** untuk periode **${(requesterUser as any)?.dates}** telah **DISETUJUI SECARA RESMI OLEH ATASAN DAN HR**:\n• Atasan Langsung: **${bossName}** (Disetujui ✓)\n• Tim HR: **${hrName}** (Disetujui ✓)\n\nHak cuti telah tercatat dan status kerja karyawan otomatis disinkronkan ke kalender tim.`
        );
      }, 500);

      addAuditLog('LEAVE_APPROVED_FULL', 'Human Resources', `Pengajuan cuti ${(requesterUser as any).name} disetujui penuh oleh Atasan (${bossName}) dan HR (${hrName})`);
    } else if (decision === 'approved') {
      const toastMsg =
        approverRole === 'boss'
          ? `✓ Pengajuan cuti telah disetujui oleh Atasan (${currentUser.name})! Menunggu validasi tim HR.`
          : `✓ Pengajuan cuti telah diverifikasi & disetujui oleh HR (${currentUser.name})! Menunggu persetujuan Atasan.`;
      setLeaveApprovalToast(toastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 5000);
    } else if (decision === 'declined') {
      const toastMsg = `Pengajuan cuti ditolak oleh ${approverRole === 'boss' ? 'Atasan' : 'HR'} (${currentUser.name}).`;
      setLeaveApprovalToast(toastMsg);
      setTimeout(() => setLeaveApprovalToast(null), 5000);
    }
  };

  const updateChannelSettings = (channelId: string, updates: Partial<Channel>) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId ? { ...c, ...updates } : c))
    );
    addAuditLog('CHANNEL_UPDATE', 'Pengaturan Grup/Channel', `Memperbarui konfigurasi grup/channel ${channelId}`);
  };

  const toggleStarChannel = (channelId: string) => {
    setChannels(prev =>
      prev.map(c => (c.id === channelId ? { ...c, isStarred: !c.isStarred } : c))
    );
  };

  const togglePinMessage = (channelId: string, messageId: string) => {
    // 1. Toggle pin on message
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map(m =>
          m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
        )
      };
    });

    // 2. Sync pinnedMessageIds on channel
    setChannels(prev =>
      prev.map(c => {
        if (c.id !== channelId) return c;
        const currentPins = c.pinnedMessageIds || [];
        const isAlreadyPinned = currentPins.includes(messageId);
        return {
          ...c,
          pinnedMessageIds: isAlreadyPinned
            ? currentPins.filter(id => id !== messageId)
            : [...currentPins, messageId]
        };
      })
    );
  };

  const toggleStarMessage = (channelId: string, messageId: string) => {
    setMessages(prev => {
      const channelMsgs = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: channelMsgs.map(m =>
          m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
        )
      };
    });
  };

  // MEETING ACTIONS
  const createMeeting = (
    data: Omit<Meeting, 'id' | 'createdAt' | 'actionItems'> & { actionItemsText?: string[] }
  ) => {
    const newMeet: Meeting = {
      ...data,
      id: 'meet_' + Date.now(),
      createdAt: new Date().toISOString(),
      actionItems: (data.actionItemsText || []).map((text, idx) => ({
        id: 'ai_' + Date.now() + '_' + idx,
        text,
        isConvertedToTask: false
      }))
    };
    setMeetings(prev => [newMeet, ...prev]);
    addAuditLog('MEETING_CREATE', 'Meeting & Schedule', `Menjadwalkan meeting: "${newMeet.title}"`);
  };

  const updateMeeting = (updated: Meeting) => {
    setMeetings(prev => prev.map(m => (m.id === updated.id ? updated : m)));
  };

  const convertActionItemToTask = (meetingId: string, actionItemId: string) => {
    const targetMeeting = meetings.find(m => m.id === meetingId);
    if (!targetMeeting) return;
    const item = targetMeeting.actionItems.find(ai => ai.id === actionItemId);
    if (!item || item.isConvertedToTask) return;

    // Create task from action item
    const newTask: Task = {
      id: 'tsk_ai_' + Date.now(),
      title: item.text,
      description: `Berasal dari Action Item rapat "${targetMeeting.title}" pada ${targetMeeting.date}.`,
      status: 'todo',
      priority: 'high',
      assigneeId: item.assigneeId || currentUser.id,
      assigneeName: item.assigneeName || currentUser.name,
      assigneeAvatar: currentUser.avatar,
      assigneeDept: currentUser.department,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      project: targetMeeting.title,
      deadline: targetMeeting.date,
      labels: ['ActionItem', 'MeetingFollowUp'],
      checklists: [{ id: 'chk_ai_1', text: 'Tindak lanjut poin aksi meeting', completed: false }],
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: 'Dikonversi otomatis dari Action Item meeting',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    // Mark action item as converted
    setMeetings(prev =>
      prev.map(m => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map(ai =>
            ai.id === actionItemId ? { ...ai, isConvertedToTask: true, taskId: newTask.id } : ai
          )
        };
      })
    );

    addAuditLog('ACTION_ITEM_TO_TASK', 'Meeting', `Action item "${item.text}" dikonversi menjadi task.`);
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  };

  // DOCUMENT ACTIONS
  const uploadDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt' | 'downloadsCount' | 'isStarred'>) => {
    const newDoc: DocumentItem = {
      ...docData,
      id: 'doc_' + Date.now(),
      downloadsCount: 0,
      isStarred: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    addAuditLog('DOC_UPLOAD', 'Document Center', `Mengunggah dokumen: "${newDoc.title}" (${newDoc.category})`);
  };

  const deleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
    addAuditLog('DOC_DELETE', 'Document Center', `Menghapus dokumen ${documentId}`);
  };

  const toggleStarDoc = (documentId: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === documentId ? { ...d, isStarred: !d.isStarred } : d))
    );
  };

  const recordDocDownload = (documentId: string) => {
    setDocuments(prev =>
      prev.map(d => (d.id === documentId ? { ...d, downloadsCount: d.downloadsCount + 1 } : d))
    );
  };

  // BRAND GOOGLE DRIVE DIRECTORY ACTIONS
  const addBrandDriveFolder = (folderData: Omit<BrandDriveFolder, 'id' | 'lastUpdated'>) => {
    const newFolder: BrandDriveFolder = {
      ...folderData,
      id: 'bdf_' + Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setBrandDriveFolders(prev => [newFolder, ...prev]);
    addAuditLog('DRIVE_FOLDER_ADD', 'Brand Google Drive', `Menambahkan direktori master folder: "${newFolder.folderTitle}"`);
  };

  const updateBrandDriveFolder = (folder: BrandDriveFolder) => {
    setBrandDriveFolders(prev =>
      prev.map(f => (f.id === folder.id ? { ...folder, lastUpdated: new Date().toISOString().split('T')[0] } : f))
    );
    addAuditLog('DRIVE_FOLDER_UPDATE', 'Brand Google Drive', `Memperbarui folder: "${folder.folderTitle}"`);
  };

  const deleteBrandDriveFolder = (id: string) => {
    setBrandDriveFolders(prev => prev.filter(f => f.id !== id));
    addAuditLog('DRIVE_FOLDER_DELETE', 'Brand Google Drive', `Menghapus master folder ${id}`);
  };

  const toggleStarBrandDriveFolder = (id: string) => {
    setBrandDriveFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, isStarred: !f.isStarred } : f))
    );
  };

  // NOTIFICATION ACTIONS
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    soundEffects.playNotificationSound();
  };

  // SOUND CONTROLS & TESTER
  const toggleSound = () => {
    const nextUnmuted = soundEffects.toggleMute();
    setIsSoundMuted(!nextUnmuted);
  };

  const setSoundMuted = (muted: boolean) => {
    soundEffects.setMuted(muted);
    setIsSoundMuted(muted);
  };

  const playTestSound = (type: 'notification' | 'chat' | 'phone' | 'task') => {
    switch (type) {
      case 'notification':
        soundEffects.playNotificationSound();
        break;
      case 'chat':
        soundEffects.playChatSound();
        break;
      case 'phone':
        soundEffects.playPhoneRingSound(5);
        break;
      case 'task':
        soundEffects.playNewTaskSound();
        break;
    }
  };

  // CROSS-DIVISION TASK REQUESTS (Permintaan Tugas Antar Divisi)
  const createDivisionRequest = (data: Omit<DivisionTaskRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: DivisionTaskRequest = {
      ...data,
      id: 'req_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setDivisionRequests(prev => [newReq, ...prev]);
    soundEffects.playNewTaskSound();

    // Send notification to target division or assignee
    addNotification({
      recipientId: data.targetAssigneeId || 'dept_' + data.targetDept,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'task',
      title: `Permintaan Tugas Baru dari ${data.requestorDept}`,
      message: `${currentUser.name} mengajukan: "${data.title}" (Tenggat: ${data.deadline})`,
      link: 'requests',
      targetTab: 'requests'
    });

    addAuditLog('DIVISION_REQ_CREATE', 'Request Antar Divisi', `Membuat request "${newReq.title}" dari ${newReq.requestorDept} ke ${newReq.targetDept}`);
  };

  const acceptDivisionRequest = (requestId: string) => {
    const targetReq = divisionRequests.find(r => r.id === requestId);
    if (!targetReq) return;

    const newTaskId = 'tsk_' + Date.now();
    const newTask: Task = {
      id: newTaskId,
      title: `[${targetReq.requestorDept}] ${targetReq.title}`,
      description: targetReq.description,
      status: 'todo', // Langsung masuk ke To-Do Board!
      priority: targetReq.priority,
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar,
      assigneeDept: targetReq.targetDept,
      reporterId: targetReq.requestorId,
      reporterName: targetReq.requestorName,
      project: `Kolaborasi ${targetReq.requestorDept} ➔ ${targetReq.targetDept}`,
      deadline: targetReq.deadline,
      labels: ['Antar-Divisi', targetReq.requestorDept],
      checklists: [
        { id: 'cl_1', text: 'Tinjau brief & spesifikasi kebutuhan', completed: true },
        { id: 'cl_2', text: 'Kerjakan deliverable sesuai tenggat waktu', completed: false },
        { id: 'cl_3', text: 'Kirimkan hasil kerja ke pemohon', completed: false }
      ],
      comments: [],
      activity: [
        {
          id: 'act_' + Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Menerima request antar divisi dari ${targetReq.requestorName} dan memasukkan ke To-Do`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    setDivisionRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'accepted',
              acceptedBy: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                acceptedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                createdTaskId: newTaskId
              }
            }
          : r
      )
    );

    soundEffects.playNewTaskSound();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}

    // Send confirmation notification to requestor
    addNotification({
      recipientId: targetReq.requestorId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      type: 'task',
      title: 'Permintaan Diterima! Masuk To-Do',
      message: `${currentUser.name} (${currentUser.department}) telah menerima "${targetReq.title}" dan memasukkannya ke To-Do board.`,
      link: 'tasks',
      targetTab: 'tasks'
    });

    addAuditLog('DIVISION_REQ_ACCEPT', 'Request Antar Divisi', `${currentUser.name} menerima request "${targetReq.title}" dari ${targetReq.requestorName} dan memasukkan ke To-Do`);
  };

  const declineDivisionRequest = (requestId: string, reason?: string) => {
    setDivisionRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: 'declined', declinedReason: reason || 'Kapasitas divisi sedang penuh' }
          : r
      )
    );
    addAuditLog('DIVISION_REQ_DECLINE', 'Request Antar Divisi', `Menolak request ${requestId}: ${reason || ''}`);
  };

  // USER & ROLE MANAGEMENT
  const updateUserRole = (userId: string, role: UserRole) => {
    // 1. Only Super Admin can change user roles
    if (currentUser.role !== 'super_admin') {
      console.warn('Hanya Super Admin yang berwenang mengubah hak akses peran karyawan.');
      return;
    }

    setUsers(prev => {
      const targetUser = prev.find(u => u.id === userId);
      if (!targetUser) return prev;

      let updatedUsers = prev.map(u => (u.id === userId ? { ...u, role } : u));

      // 2. Rule: Super Admin harus selalu ada.
      // Jika seandainya superadmin ganti/diturunkan, otomatis title super admin bakal pindah ke akun yang paling lama bergabung.
      const hasSuperAdmin = updatedUsers.some(u => u.role === 'super_admin');
      if (!hasSuperAdmin) {
        // Find the oldest registered account among remaining users (sorted by joinedDate ascending)
        const candidates = updatedUsers.filter(u => u.id !== userId);
        const pool = candidates.length > 0 ? candidates : updatedUsers;
        const sortedOldest = [...pool].sort((a, b) => {
          const dateA = new Date(a.joinedDate || '2099-01-01').getTime();
          const dateB = new Date(b.joinedDate || '2099-01-01').getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.id.localeCompare(b.id);
        });

        const oldestUser = sortedOldest[0];
        if (oldestUser) {
          updatedUsers = updatedUsers.map(u =>
            u.id === oldestUser.id ? { ...u, role: 'super_admin' as UserRole } : u
          );
          addAuditLog(
            'SUPER_ADMIN_AUTO_TRANSFER',
            'Admin RBAC',
            `Gelar Super Admin otomatis dialihkan ke akun karyawan tertua: ${oldestUser.name} (${oldestUser.email}, bergabung ${oldestUser.joinedDate}) karena Super Admin sebelumnya diturunkan.`
          );
        }
      }

      // Sync currentUser if updated
      const currentUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (currentUpdated) {
        setCurrentUserState(currentUpdated);
      }

      return updatedUsers;
    });

    addAuditLog('USER_ROLE_CHANGE', 'Admin RBAC', `Mengubah wewenang role user ${userId} menjadi ${role}`);
  };

  const updateUserStatus = (status: AvailabilityStatus) => {
    setCurrentUserState(prev => ({ ...prev, status }));
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, status } : u))
    );
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser.id === userId) {
      setCurrentUserState(prev => ({ ...prev, ...updates }));
    }
    addAuditLog('USER_UPDATE', 'Manajemen Personel', `Memperbarui profil personel ID: ${userId}`);
  };

  const deleteUser = (userId: string) => {
    // 1. Minimum user safety: cannot delete if only 1 user left
    if (users.length <= 1) {
      console.warn('Tidak dapat menghapus personel terakhir di sistem.');
      return;
    }

    setUsers(prev => {
      const targetUser = prev.find(u => u.id === userId);
      if (!targetUser) return prev;

      let remainingUsers = prev.filter(u => u.id !== userId);

      // Rule: Super Admin HARUS SELALU ADA.
      // Jika akun Super Admin yang dihapus, otomatis dipindahkan ke personel yang paling lama bergabung
      const hasSuperAdmin = remainingUsers.some(u => u.role === 'super_admin');
      if (!hasSuperAdmin) {
        const sortedOldest = [...remainingUsers].sort((a, b) => {
          const dateA = new Date(a.joinedDate || '2099-01-01').getTime();
          const dateB = new Date(b.joinedDate || '2099-01-01').getTime();
          if (dateA !== dateB) return dateA - dateB;
          return a.id.localeCompare(b.id);
        });

        const oldestUser = sortedOldest[0];
        if (oldestUser) {
          remainingUsers = remainingUsers.map(u =>
            u.id === oldestUser.id ? { ...u, role: 'super_admin' as UserRole } : u
          );
          addAuditLog(
            'SUPER_ADMIN_AUTO_TRANSFER',
            'Manajemen Akses',
            `Hak Super Admin dialihkan otomatis ke ${oldestUser.name} (${oldestUser.email}).`
          );
        }
      }

      // If the current logged in user deleted their own account, switch session
      if (currentUser.id === userId) {
        const nextActive = remainingUsers.find(u => u.role === 'super_admin') || remainingUsers[0];
        setCurrentUserState(nextActive);
      }

      return remainingUsers;
    });

    addAuditLog('USER_DELETE', 'Manajemen Personel', `Menghapus akun personel ID: ${userId}`);
  };

  const inviteUser = (userData: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
    position: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
    skills?: string[];
  }): User => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      role: userData.role || 'employee',
      department: userData.department,
      position: userData.position.trim(),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      phone: userData.phone?.trim() || '+62 812-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
      location: userData.location?.trim() || 'Kantor Pusat - Jakarta',
      status: 'online',
      bio: userData.bio?.trim() || `Personel divisi ${userData.department}.`,
      skills: userData.skills?.length ? userData.skills : ['Kolaborasi', 'Manajemen Proyek'],
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);

    // System notification
    const inviteNotif: NotificationItem = {
      id: 'notif_invite_' + Date.now(),
      recipientId: currentUser.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      type: 'system',
      title: 'Personel Baru Terdaftar',
      message: `${newUser.name} resmi terdaftar sebagai ${newUser.position} di divisi ${newUser.department}.`,
      link: 'directory',
      targetTab: 'directory',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [inviteNotif, ...prev]);

    addAuditLog('USER_INVITE', 'Manajemen Personel', `Mendaftarkan personel baru: ${newUser.name} (${newUser.position} - ${newUser.department})`);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    return newUser;
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setPosts(INITIAL_POSTS);
    setTasks(INITIAL_TASKS);
    setChannels(INITIAL_CHANNELS);
    setMessages(INITIAL_MESSAGES);
    setMeetings(INITIAL_MEETINGS);
    setDocuments(INITIAL_DOCUMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    window.location.reload();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        activeTab,
        setActiveTab,
        themeSettings,
        updateThemeSettings,
        themeMode: themeSettings.mode,
        toggleTheme,
        setThemeMode,
        workspaceInfo,
        updateWorkspaceInfo,
        isAuthenticated,
        login,
        logout,
        registerUser,
        isRightNotificationOpen,
        setIsRightNotificationOpen,
        toggleRightNotifications,
        posts,
        createPost,
        likePost,
        bookmarkPost,
        addComment,
        votePoll,
        togglePinPost,
        deletePost,
        tasks,
        selectedTaskGroup,
        setSelectedTaskGroup,
        createTask,
        updateTask,
        moveTaskStatus,
        toggleChecklistItem,
        toggleTaskCheckpoint,
        addTaskCheckpoint,
        addTaskReport,
        addTaskComment,
        deleteTask,
        updateTaskBriefFormat,
        updateTaskVideoDraft,
        updateTaskSlideDraft,
        updateTaskPosterDraft,
        sendTaskForApproval,
        processTaskApproval,
        archiveTask,
        unarchiveTask,
        activeHuddle,
        startHuddle,
        endHuddle,
        toggleHuddleMinimize,
        toggleHuddleMic,
        toggleHuddleVideo,
        toggleHuddleScreenShare,
        sendHuddleReaction,
        channels,
        activeChannelId,
        setActiveChannelId,
        markChannelAsRead,
        messages,
        sendMessage,
        toggleReaction,
        createChannel,
        updateChannelSettings,
        toggleStarChannel,
        togglePinMessage,
        toggleStarMessage,
        startDirectMessage,
        submitLeaveRequest,
        processLeaveApproval,
        leaveApprovalToast,
        setLeaveApprovalToast,
        meetings,
        createMeeting,
        updateMeeting,
        convertActionItemToTask,
        deleteMeeting,
        documents,
        uploadDocument,
        deleteDocument,
        toggleStarDoc,
        recordDocDownload,
        brandDriveFolders,
        addBrandDriveFolder,
        updateBrandDriveFolder,
        deleteBrandDriveFolder,
        toggleStarBrandDriveFolder,
        divisions,
        addDivision,
        deleteDivision,
        updateDivision,
        notifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadNotificationsCount,
        updateUserRole,
        updateUserStatus,
        deleteUser,
        inviteUser,
        auditLogs,
        addAuditLog,
        isQuickSearchOpen,
        setIsQuickSearchOpen,
        quickActionModal,
        setQuickActionModal,
        resetAllData,
        isDbHubOpen,
        setIsDbHubOpen,
        resetToInitialCorporateData: resetAllData,
        isSoundMuted,
        toggleSound,
        setSoundMuted,
        playTestSound,
        addNotification,
        divisionRequests,
        createDivisionRequest,
        acceptDivisionRequest,
        declineDivisionRequest,
        pendingApprovals,
        submitUserApprovalRequest,
        approveUserRegistration,
        rejectUserRegistration
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
