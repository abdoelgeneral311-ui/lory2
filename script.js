// ========== CONFIGURATION & CONSTANTS ==========
const CONFIG = {
    CREDENTIALS: {
        USERNAME: 'lory',
        PASSWORD: '06/12/2006'
    },
    HSK: {
        QUESTIONS_PER_SESSION: 10,
        TOTAL_QUESTIONS_PER_LEVEL: 100,
        LEVELS: ['easy', 'medium', 'hard'],
        ACHIEVEMENTS: [
            { id: 1, name: 'Discord Nitro 1 month', points: 100, icon: '🐱‍🏍' },
            { id: 2, name: "lory's hoodie", points: 200, icon: '👧' },
            { id: 3, name: 'Hang out with baby', points: 295, icon: '😎' }
        ],
        SCORE_THRESHOLDS: {
            HIGH: 8,
            LOW: 5
        }
    },
    POINTS: {
        CORRECT_ANSWER: 1,
        LEVELS: [
            { name: 'Beginner', min: 0, max: 50, color: '#4CAF50', icon: '🌱' },
            { name: 'Intermediate', min: 51, max: 150, color: '#2196F3', icon: '⚡' },
            { name: 'Expert', min: 151, max: 249, color: '#FF9800', icon: '🎯' },
            { name: 'Legend', min: 250, max: 1000, color: '#9C27B0', icon: '👑' }
        ]
    },
    NOTIFICATIONS: {
        POINTS_MILESTONES: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200, 250, 295],
        ACHIEVEMENT_THRESHOLD: 0.9 // 90%
    }
};

// ========== STATE MANAGEMENT ==========
const state = {
    // User state
    currentScreen: 'login',
    currentPage: 'profile',
    theme: 'light',
    
    // HSK state
    hskSession: {
        difficulty: null,
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: new Array(CONFIG.HSK.QUESTIONS_PER_SESSION).fill(null),
        score: 0,
        startTime: null,
        timerInterval: null
    },
    
    // Progress tracking
    progress: {
        totalPoints: 0,
        totalCorrect: 0,
        totalSessions: 0,
        answeredQuestions: {
            easy: new Set(),
            medium: new Set(),
            hard: new Set()
        },
        achievements: {
            1: { progress: 0, unlocked: false },
            2: { progress: 0, unlocked: false },
            3: { progress: 0, unlocked: false }
        },
        history: [],
        dailyStreak: 0,
        lastLoginDate: null
    },
    
    // Notifications
    notifications: [],
    unreadNotifications: 0
};

// ========== QUESTION DATABASE ==========
// Note: In a real application, these would be loaded from a server
// For this demo, we'll use simplified questions. You can replace with your 300 questions.
const HSK_QUESTIONS = {
    easy: Array.from({ length: 100 }, (_, i) => ({
        id: `easy-${i + 1}`,
        type: ['Multiple Choice', 'True/False', 'Translation'][i % 3],
        question: `Easy Question ${i + 1}: What does "你好" mean?`,
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        correct: 0
    })),
    medium: Array.from({ length: 100 }, (_, i) => ({
        id: `medium-${i + 1}`,
        type: ['Multiple Choice', 'Complete Sentence', 'Grammar Check'][i % 3],
        question: `Medium Question ${i + 1}: Choose the correct sentence.`,
        options: ['我是学生', '我学生是', '学生是我', '是学生我'],
        correct: 0
    })),
    hard: Array.from({ length: 100 }, (_, i) => ({
        id: `hard-${i + 1}`,
        type: ['Sentence Order', 'Error Detection', 'Context Understanding'][i % 3],
        question: `Hard Question ${i + 1}: Identify the grammar error.`,
        options: ['我是在学生', '我是学生了', '我是学生', '我是学生吗'],
        correct: 0
    }))
};

// ========== DOM ELEMENTS ==========
const elements = {
    // Screens
    screens: {
        login: document.getElementById('login-screen'),
        welcome: document.getElementById('welcome-screen'),
        main: document.getElementById('main-app')
    },
    
    // Login
    login: {
        form: document.getElementById('login-form'),
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        togglePassword: document.getElementById('toggle-password'),
        btn: document.querySelector('.login-btn'),
        error: document.getElementById('login-error'),
        forgotLink: document.getElementById('forgot-password'),
        forgotMessage: document.getElementById('forgot-message')
    },
    
    // Welcome
    welcome: {
        yesBtn: document.getElementById('yes-btn'),
        lazyBtn: document.getElementById('lazy-btn'),
        byeMessage: document.getElementById('bye-message')
    },
    
    // Navigation
    nav: {
        profile: document.getElementById('nav-profile'),
        hsk: document.getElementById('nav-hsk'),
        score: document.getElementById('nav-score')
    },
    
    // Pages
    pages: {
        profile: document.getElementById('profile-page'),
        hsk: document.getElementById('hsk-page'),
        score: document.getElementById('score-page')
    },
    
    // HSK
    hsk: {
        difficultySelection: document.getElementById('hsk-difficulty-selection'),
        quizSession: document.getElementById('hsk-quiz-session'),
        resultsScreen: document.getElementById('hsk-results-screen'),
        
        // Difficulty cards
        easyAnswered: document.getElementById('easy-answered'),
        mediumAnswered: document.getElementById('medium-answered'),
        hardAnswered: document.getElementById('hard-answered'),
        difficultyCards: document.querySelectorAll('.difficulty-card'),
        
        // Quiz session
        currentQuestion: document.getElementById('current-question'),
        currentDifficulty: document.getElementById('current-difficulty'),
        difficultyBadge: document.getElementById('difficulty-badge'),
        questionType: document.getElementById('question-type'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        nextQuestionBtn: document.getElementById('next-question-btn'),
        quizProgressFill: document.getElementById('quiz-progress-fill'),
        quizTimer: document.getElementById('quiz-timer'),
        quizCorrect: document.getElementById('quiz-correct'),
        exitQuiz: document.getElementById('exit-quiz'),
        
        // Results
        finalScore: document.getElementById('final-score'),
        resultsDifficulty: document.getElementById('results-difficulty'),
        babyMessage: document.getElementById('baby-message'),
        resultsCorrect: document.getElementById('results-correct'),
        resultsTime: document.getElementById('results-time'),
        resultsPoints: document.getElementById('results-points'),
        retryBtn: document.getElementById('retry-btn'),
        hskHomeBtn: document.getElementById('hsk-home-btn')
    },
    
    // Score & Achievements
    score: {
        // Points
        totalPoints: document.getElementById('total-points'),
        sidebarPoints: document.getElementById('sidebar-points'),
        levelBadge: document.getElementById('level-badge'),
        levelName: document.getElementById('level-name'),
        levelRange: document.getElementById('level-range'),
        levelProgressText: document.getElementById('level-progress-text'),
        levelProgressFill: document.getElementById('level-progress-fill'),
        userLevel: document.getElementById('user-level'),
        
        // Stats
        totalCorrect: document.getElementById('total-correct'),
        profileCorrect: document.getElementById('profile-correct'),
        totalSessions: document.getElementById('total-sessions'),
        profileSessions: document.getElementById('profile-sessions'),
        accuracyRate: document.getElementById('accuracy-rate'),
        profileStreak: document.getElementById('profile-streak'),
        
        // Achievements
        achievement1: {
            progress: document.getElementById('achievement-1-progress'),
            percent: document.getElementById('achievement-1-percent'),
            fill: document.getElementById('achievement-1-fill'),
            status: document.getElementById('achievement-1-status')
        },
        achievement2: {
            progress: document.getElementById('achievement-2-progress'),
            percent: document.getElementById('achievement-2-percent'),
            fill: document.getElementById('achievement-2-fill'),
            status: document.getElementById('achievement-2-status')
        },
        achievement3: {
            progress: document.getElementById('achievement-3-progress'),
            percent: document.getElementById('achievement-3-percent'),
            fill: document.getElementById('achievement-3-fill'),
            status: document.getElementById('achievement-3-status')
        }
    },
    
    // Theme & Notifications
    themeToggle: document.getElementById('theme-toggle'),
    notificationBell: document.getElementById('notification-bell'),
    notificationCount: document.getElementById('notification-count'),
    notificationDropdown: document.getElementById('notification-dropdown'),
    notificationList: document.getElementById('notification-list'),
    clearNotifications: document.getElementById('clear-notifications'),
    notificationPopup: document.getElementById('notification-popup')
};

// ========== UTILITY FUNCTIONS ==========
class Utils {
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    static getRandomQuestions(questions, count, excludeIds = []) {
        const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    static calculatePercentage(value, total) {
        return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
    }
    
    static getCurrentLevel(points) {
        return CONFIG.POINTS.LEVELS.find(level => 
            points >= level.min && points <= level.max
        ) || CONFIG.POINTS.LEVELS[0];
    }
    
    static saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(`lory_${key}`, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
    
    static loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(`lory_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }
    
    static addHistoryEvent(title, description) {
        const event = {
            id: Date.now(),
            title,
            description,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        };
        
        state.progress.history.unshift(event);
        if (state.progress.history.length > 10) {
            state.progress.history = state.progress.history.slice(0, 10);
        }
        
        Utils.saveToLocalStorage('progress', state.progress);
    }
}

// ========== NOTIFICATION SYSTEM ==========
class NotificationSystem {
    static showNotification(title, message, type = 'info') {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false
        };
        
        state.notifications.unshift(notification);
        state.unreadNotifications++;
        
        // Update UI
        NotificationSystem.updateNotificationCount();
        NotificationSystem.addNotificationToList(notification);
        
        // Show popup
        NotificationSystem.showPopup(notification);
        
        // Save to localStorage
        Utils.saveToLocalStorage('notifications', state.notifications);
    }
    
    static showPopup(notification) {
        const popup = elements.notificationPopup;
        const iconMap = {
            'points': 'fas fa-star',
            'achievement': 'fas fa-trophy',
            'level': 'fas fa-level-up-alt',
            'info': 'fas fa-info-circle'
        };
        
        popup.querySelector('.popup-icon').innerHTML = `<i class="${iconMap[notification.type] || 'fas fa-bell'}"></i>`;
        popup.querySelector('.popup-title').textContent = notification.title;
        popup.querySelector('.popup-message').textContent = notification.message;
        
        popup.classList.add('show');
        
        // Auto hide after 4 seconds
        setTimeout(() => {
            popup.classList.remove('show');
        }, 4000);
    }
    
    static updateNotificationCount() {
        if (elements.notificationCount) {
            elements.notificationCount.textContent = state.unreadNotifications;
            elements.notificationCount.style.display = state.unreadNotifications > 0 ? 'flex' : 'none';
        }
    }
    
    static addNotificationToList(notification) {
        if (!elements.notificationList) return;
        
        const emptyElement = elements.notificationList.querySelector('.empty-notifications');
        if (emptyElement) {
            emptyElement.remove();
        }
        
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <div class="notification-item-header">
                <span class="notification-item-title">${notification.title}</span>
                <span class="notification-item-time">${new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="notification-item-message">${notification.message}</div>
        `;
        
        notificationItem.addEventListener('click', () => {
            notification.read = true;
            state.unreadNotifications = Math.max(0, state.unreadNotifications - 1);
            NotificationSystem.updateNotificationCount();
            notificationItem.classList.remove('unread');
            Utils.saveToLocalStorage('notifications', state.notifications);
        });
        
        elements.notificationList.prepend(notificationItem);
    }
    
    static loadNotifications() {
        const savedNotifications = Utils.loadFromLocalStorage('notifications') || [];
        state.notifications = savedNotifications;
        state.unreadNotifications = savedNotifications.filter(n => !n.read).length;
        
        // Update UI
        NotificationSystem.updateNotificationCount();
        
        // Add notifications to list
        if (elements.notificationList) {
            elements.notificationList.innerHTML = '';
            
            if (state.notifications.length === 0) {
                elements.notificationList.innerHTML = `
                    <div class="empty-notifications">
                        <i class="fas fa-bell-slash"></i>
                        <p>No notifications yet</p>
                    </div>
                `;
            } else {
                state.notifications.forEach(notification => {
                    NotificationSystem.addNotificationToList(notification);
                });
            }
        }
    }
    
    static clearAllNotifications() {
        state.notifications = [];
        state.unreadNotifications = 0;
        NotificationSystem.updateNotificationCount();
        
        if (elements.notificationList) {
            elements.notificationList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
        }
        
        Utils.saveToLocalStorage('notifications', []);
    }
}

// ========== THEME MANAGEMENT ==========
class ThemeManager {
    static init() {
        // Load saved theme
        const savedTheme = Utils.loadFromLocalStorage('theme') || 'light';
        ThemeManager.setTheme(savedTheme);
        
        // Setup toggle button
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', ThemeManager.toggleTheme);
        }
    }
    
    static setTheme(theme) {
        state.theme = theme;
        document.body.className = `${theme}-mode`;
        
        // Update toggle button position
        if (elements.themeToggle) {
            const slider = elements.themeToggle.querySelector('.theme-slider');
            if (slider) {
                slider.style.transform = theme === 'dark' ? 'translateX(30px)' : 'translateX(0)';
            }
        }
        
        Utils.saveToLocalStorage('theme', theme);
    }
    
    static toggleTheme() {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        ThemeManager.setTheme(newTheme);
        
        // Show notification
        NotificationSystem.showNotification(
            'Theme Changed',
            `Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`,
            'info'
        );
    }
}

// ========== PROGRESS MANAGEMENT ==========
class ProgressManager {
    static init() {
        // Load saved progress
        const savedProgress = Utils.loadFromLocalStorage('progress');
        if (savedProgress) {
            // Convert Set objects back from arrays
            if (savedProgress.answeredQuestions) {
                Object.keys(savedProgress.answeredQuestions).forEach(level => {
                    if (Array.isArray(savedProgress.answeredQuestions[level])) {
                        state.progress.answeredQuestions[level] = new Set(savedProgress.answeredQuestions[level]);
                    }
                });
            }
            
            // Merge other progress data
            Object.keys(savedProgress).forEach(key => {
                if (key !== 'answeredQuestions') {
                    state.progress[key] = savedProgress[key];
                }
            });
        }
        
        // Check daily streak
        ProgressManager.checkDailyStreak();
        
        // Update UI
        ProgressManager.updateAllProgressUI();
    }
    
    static checkDailyStreak() {
        const today = new Date().toDateString();
        const lastLogin = state.progress.lastLoginDate ? new Date(state.progress.lastLoginDate).toDateString() : null;
        
        if (!lastLogin) {
            // First login
            state.progress.dailyStreak = 1;
            state.progress.lastLoginDate = new Date().toISOString();
        } else if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastLogin === yesterday.toDateString()) {
                // Consecutive day
                state.progress.dailyStreak++;
            } else {
                // Broken streak
                state.progress.dailyStreak = 1;
            }
            
            state.progress.lastLoginDate = new Date().toISOString();
        }
    }
    
    static addPoints(points) {
        const oldPoints = state.progress.totalPoints;
        state.progress.totalPoints += points;
        state.progress.totalCorrect += points; // 1 point per correct answer
        
        // Check for level up
        const oldLevel = Utils.getCurrentLevel(oldPoints);
        const newLevel = Utils.getCurrentLevel(state.progress.totalPoints);
        
        if (oldLevel.name !== newLevel.name) {
            NotificationSystem.showNotification(
                'Level Up! 🚀',
                `Congratulations! You're now a ${newLevel.name}! ${newLevel.icon}`,
                'level'
            );
            
            Utils.addHistoryEvent('Level Up!', `Reached ${newLevel.name} level`);
        }
        
        // Check for milestone notifications
        CONFIG.NOTIFICATIONS.POINTS_MILESTONES.forEach(milestone => {
            if (oldPoints < milestone && state.progress.totalPoints >= milestone) {
                NotificationSystem.showNotification(
                    'Milestone Reached! 🎉',
                    `You've reached ${milestone} points! Keep going!`,
                    'points'
                );
            }
        });
        
        // Update achievements progress
        ProgressManager.updateAchievementsProgress();
        
        // Save progress
        ProgressManager.saveProgress();
        
        // Update UI
        ProgressManager.updateAllProgressUI();
    }
    
    static addAnsweredQuestion(difficulty, questionId) {
        state.progress.answeredQuestions[difficulty].add(questionId);
        ProgressManager.saveProgress();
        ProgressManager.updateAnsweredQuestionsUI();
    }
    
    static updateAchievementsProgress() {
        CONFIG.HSK.ACHIEVEMENTS.forEach(achievement => {
            const progress = Math.min(state.progress.totalPoints, achievement.points);
            const percent = Utils.calculatePercentage(progress, achievement.points);
            const unlocked = progress >= achievement.points;
            
            state.progress.achievements[achievement.id] = {
                progress,
                unlocked,
                percent
            };
            
            // Check if achievement was just unlocked
            const oldProgress = Utils.loadFromLocalStorage('progress')?.achievements?.[achievement.id]?.progress || 0;
            if (!oldProgress && progress > 0) {
                // First progress on this achievement
                if (percent >= CONFIG.NOTIFICATIONS.ACHIEVEMENT_THRESHOLD * 100) {
                    NotificationSystem.showNotification(
                        'Achievement Almost Unlocked! 🔥',
                        `You're ${100 - percent}% away from "${achievement.name}"`,
                        'achievement'
                    );
                }
            }
            
            if (oldProgress < achievement.points && progress >= achievement.points) {
                // Achievement unlocked!
                NotificationSystem.showNotification(
                    'Achievement Unlocked! 🏆',
                    `Congratulations! You unlocked "${achievement.name}" ${achievement.icon}`,
                    'achievement'
                );
                
                Utils.addHistoryEvent('Achievement Unlocked!', `Earned ${achievement.name}`);
                
                // Special notification for final achievement
                if (achievement.id === 3) {
                    if (state.progress.totalPoints >= 295) {
                        NotificationSystem.showNotification(
                            'Final Achievement! 😍',
                            'Wow! Now you are able to hangout with baby!',
                            'achievement'
                        );
                    } else {
                        NotificationSystem.showNotification(
                            'All Questions Answered! 😥',
                            'Sorry, you can\'t hangout with baby...',
                            'info'
                        );
                    }
                }
            }
        });
    }
    
    static updateAllProgressUI() {
        // Update points display
        if (elements.score.totalPoints) {
            elements.score.totalPoints.textContent = state.progress.totalPoints;
        }
        
        if (elements.score.sidebarPoints) {
            elements.score.sidebarPoints.textContent = state.progress.totalPoints;
        }
        
        // Update level display
        const currentLevel = Utils.getCurrentLevel(state.progress.totalPoints);
        const nextLevel = CONFIG.POINTS.LEVELS.find(level => level.min > currentLevel.min) || currentLevel;
        
        if (elements.score.levelName) {
            elements.score.levelName.textContent = currentLevel.name;
        }
        
        if (elements.score.userLevel) {
            elements.score.userLevel.textContent = currentLevel.name;
        }
        
        if (elements.score.levelRange) {
            elements.score.levelRange.textContent = `${currentLevel.min} - ${currentLevel.max} points`;
        }
        
        if (elements.score.levelProgressText) {
            const progressPercent = Utils.calculatePercentage(
                state.progress.totalPoints - currentLevel.min,
                nextLevel.min - currentLevel.min
            );
            elements.score.levelProgressText.textContent = `${progressPercent}%`;
            
            if (elements.score.levelProgressFill) {
                elements.score.levelProgressFill.style.width = `${progressPercent}%`;
            }
        }
        
        // Update stats
        if (elements.score.totalCorrect) {
            elements.score.totalCorrect.textContent = state.progress.totalCorrect;
        }
        
        if (elements.score.profileCorrect) {
            elements.score.profileCorrect.textContent = state.progress.totalCorrect;
        }
        
        if (elements.score.totalSessions) {
            elements.score.totalSessions.textContent = state.progress.totalSessions;
        }
        
        if (elements.score.profileSessions) {
            elements.score.profileSessions.textContent = state.progress.totalSessions;
        }
        
        if (elements.score.profileStreak) {
            elements.score.profileStreak.textContent = state.progress.dailyStreak;
        }
        
        if (elements.score.accuracyRate) {
            const totalAnswered = Array.from(state.progress.answeredQuestions.easy).length +
                                Array.from(state.progress.answeredQuestions.medium).length +
                                Array.from(state.progress.answeredQuestions.hard).length;
            const accuracy = totalAnswered > 0 ? 
                Utils.calculatePercentage(state.progress.totalCorrect, totalAnswered) : 0;
            elements.score.accuracyRate.textContent = `${accuracy}%`;
        }
        
        // Update achievements UI
        ProgressManager.updateAchievementsUI();
    }
    
    static updateAchievementsUI() {
        CONFIG.HSK.ACHIEVEMENTS.forEach(achievement => {
            const achievementData = state.progress.achievements[achievement.id];
            const elements = ProgressManager.getAchievementElements(achievement.id);
            
            if (elements.progress) {
                elements.progress.textContent = achievementData.progress;
            }
            
            if (elements.percent) {
                elements.percent.textContent = `${achievementData.percent}%`;
            }
            
            if (elements.fill) {
                elements.fill.style.width = `${achievementData.percent}%`;
            }
            
            if (elements.status) {
                if (achievementData.unlocked) {
                    elements.status.innerHTML = `
                        <span class="status-unlocked">
                            <i class="fas fa-unlock"></i> Unlocked!
                        </span>
                    `;
                    elements.status.parentElement.classList.add('unlocked');
                } else {
                    elements.status.innerHTML = `
                        <span class="status-locked">
                            <i class="fas fa-lock"></i> Locked
                        </span>
                    `;
                    elements.status.parentElement.classList.remove('unlocked');
                }
            }
        });
    }
    
    static getAchievementElements(id) {
        switch(id) {
            case 1: return elements.score.achievement1;
            case 2: return elements.score.achievement2;
            case 3: return elements.score.achievement3;
            default: return {};
        }
    }
    
    static updateAnsweredQuestionsUI() {
        if (elements.hsk.easyAnswered) {
            elements.hsk.easyAnswered.textContent = state.progress.answeredQuestions.easy.size;
        }
        
        if (elements.hsk.mediumAnswered) {
            elements.hsk.mediumAnswered.textContent = state.progress.answeredQuestions.medium.size;
        }
        
        if (elements.hsk.hardAnswered) {
            elements.hsk.hardAnswered.textContent = state.progress.answeredQuestions.hard.size;
        }
    }
    
    static saveProgress() {
        // Convert Sets to Arrays for storage
        const progressToSave = {
            ...state.progress,
            answeredQuestions: {
                easy: Array.from(state.progress.answeredQuestions.easy),
                medium: Array.from(state.progress.answeredQuestions.medium),
                hard: Array.from(state.progress.answeredQuestions.hard)
            }
        };
        
        Utils.saveToLocalStorage('progress', progressToSave);
    }
}

// ========== SCREEN & PAGE MANAGEMENT ==========
class NavigationManager {
    static init() {
        // Setup navigation links
        Object.values(elements.nav).forEach(navElement => {
            if (navElement) {
                navElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = navElement.getAttribute('data-page');
                    NavigationManager.showPage(page);
                    
                    // Update active nav
                    Object.values(elements.nav).forEach(n => n.classList.remove('active'));
                    navElement.classList.add('active');
                });
            }
        });
        
        // Set initial page
        NavigationManager.showPage('profile');
    }
    
    static showScreen(screenName) {
        // Hide all screens
        Object.values(elements.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Show requested screen
        if (elements.screens[screenName]) {
            elements.screens[screenName].classList.add('active');
            state.currentScreen = screenName;
        }
        
        // Special handling for welcome screen
        if (screenName === 'welcome') {
            if (elements.welcome.yesBtn) {
                elements.welcome.yesBtn.style.display = 'block';
            }
            if (elements.welcome.lazyBtn) {
                elements.welcome.lazyBtn.style.display = 'block';
            }
            if (elements.welcome.byeMessage) {
                elements.welcome.byeMessage.style.display = 'none';
            }
        }
    }
    
    static showPage(pageName) {
        // Hide all pages
        Object.values(elements.pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // Show requested page
        if (elements.pages[pageName]) {
            elements.pages[pageName].classList.add('active');
            state.currentPage = pageName;
            
            // Special handling for HSK page
            if (pageName === 'hsk') {
                HSKManager.showDifficultySelection();
                ProgressManager.updateAnsweredQuestionsUI();
            }
            
            // Special handling for Score page
            if (pageName === 'score') {
                ProgressManager.updateAllProgressUI();
            }
        }
    }
    
    static showHSKSection(sectionName) {
        const sections = ['hsk-difficulty-selection', 'hsk-quiz-session', 'hsk-results-screen'];
        
        // Hide all sections
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.classList.remove('active');
        });
        
        // Show requested section
        const targetSection = document.getElementById(`hsk-${sectionName.replace('hsk-', '')}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
}

// ========== LOGIN SYSTEM ==========
class LoginSystem {
    static init() {
        if (elements.login.form) {
            elements.login.form.addEventListener('submit', LoginSystem.handleLogin);
        }
        
        if (elements.login.togglePassword) {
            elements.login.togglePassword.addEventListener('click', LoginSystem.togglePasswordVisibility);
        }
        
        if (elements.login.forgotLink) {
            elements.login.forgotLink.addEventListener('click', LoginSystem.handleForgotPassword);
        }
        
        // Allow Enter key to submit
        if (elements.login.password) {
            elements.login.password.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    LoginSystem.handleLogin(e);
                }
            });
        }
    }
    
    static handleLogin(e) {
        e.preventDefault();
        
        const username = elements.login.username.value.trim();
        const password = elements.login.password.value.trim();
        
        if (username === CONFIG.CREDENTIALS.USERNAME && password === CONFIG.CREDENTIALS.PASSWORD) {
            // Successful login
            LoginSystem.hideError();
            
            // Show welcome screen
            NavigationManager.showScreen('welcome');
            
            // Add history event
            Utils.addHistoryEvent('Login', 'Started a new learning session');
            
            // Show welcome notification
            NotificationSystem.showNotification(
                'Welcome Back! 👋',
                `You have ${state.progress.totalPoints} points waiting! Let's continue learning!`,
                'info'
            );
        } else {
            // Failed login
            LoginSystem.showError();
        }
    }
    
    static showError() {
        if (elements.login.error) {
            elements.login.error.style.display = 'flex';
            
            // Highlight input fields
            if (elements.login.username) {
                elements.login.username.style.borderColor = '#f44336';
            }
            if (elements.login.password) {
                elements.login.password.style.borderColor = '#f44336';
            }
            
            // Reset borders after 2 seconds
            setTimeout(() => {
                if (elements.login.username) {
                    elements.login.username.style.borderColor = '';
                }
                if (elements.login.password) {
                    elements.login.password.style.borderColor = '';
                }
            }, 2000);
        }
    }
    
    static hideError() {
        if (elements.login.error) {
            elements.login.error.style.display = 'none';
        }
    }
    
    static togglePasswordVisibility() {
        const passwordInput = elements.login.password;
        const icon = elements.login.togglePassword;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    static handleForgotPassword(e) {
        e.preventDefault();
        
        if (elements.login.forgotMessage) {
            elements.login.forgotMessage.textContent = 'Ask baby';
            elements.login.forgotMessage.style.display = 'block';
            
            // Reset after 3 seconds
            setTimeout(() => {
                elements.login.forgotMessage.style.display = 'none';
            }, 3000);
        }
    }
}

// ========== WELCOME SCREEN ==========
class WelcomeScreen {
    static init() {
        if (elements.welcome.yesBtn) {
            elements.welcome.yesBtn.addEventListener('click', WelcomeScreen.handleYes);
        }
        
        if (elements.welcome.lazyBtn) {
            elements.welcome.lazyBtn.addEventListener('click', WelcomeScreen.handleLazy);
        }
    }
    
    static handleYes() {
        // Animate out
        if (elements.screens.welcome) {
            elements.screens.welcome.style.opacity = '0';
            elements.screens.welcome.style.transform = 'scale(0.95)';
            elements.screens.welcome.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                // Show main app
                NavigationManager.showScreen('main');
                
                // Reset welcome screen for next time
                elements.screens.welcome.style.opacity = '1';
                elements.screens.welcome.style.transform = 'scale(1)';
            }, 600);
        }
    }
    
    static handleLazy() {
        // Hide buttons
        if (elements.welcome.yesBtn) {
            elements.welcome.yesBtn.style.display = 'none';
        }
        if (elements.welcome.lazyBtn) {
            elements.welcome.lazyBtn.style.display = 'none';
        }
        
        // Show bye message
        if (elements.welcome.byeMessage) {
            elements.welcome.byeMessage.style.display = 'block';
        }
        
        // Change background
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        
        // Show sleep message after 3 seconds
        setTimeout(() => {
            if (elements.screens.welcome) {
                elements.screens.welcome.innerHTML = `
                    <div class="welcome-container" style="text-align:center;">
                        <h2 style="color:#888; font-size:3.5rem;"><i class="fas fa-bed"></i></h2>
                        <h3 style="color:#777; margin-top:30px; font-size:2rem;">App is sleeping. Refresh to restart.</h3>
                    </div>
                `;
            }
        }, 3000);
    }
}

// ========== HSK TEST SYSTEM ==========
class HSKManager {
    static init() {
        // Setup difficulty cards
        if (elements.hsk.difficultyCards) {
            elements.hsk.difficultyCards.forEach(card => {
                card.addEventListener('click', () => {
                    const difficulty = card.getAttribute('data-difficulty');
                    HSKManager.startNewSession(difficulty);
                });
            });
        }
        
        // Setup quiz controls
        if (elements.hsk.nextQuestionBtn) {
            elements.hsk.nextQuestionBtn.addEventListener('click', HSKManager.handleNextQuestion);
        }
        
        if (elements.hsk.exitQuiz) {
            elements.hsk.exitQuiz.addEventListener('click', HSKManager.exitQuiz);
        }
        
        if (elements.hsk.retryBtn) {
            elements.hsk.retryBtn.addEventListener('click', HSKManager.retrySession);
        }
        
        if (elements.hsk.hskHomeBtn) {
            elements.hsk.hskHomeBtn.addEventListener('click', () => {
                NavigationManager.showPage('profile');
            });
        }
    }
    
    static startNewSession(difficulty) {
        // Reset session state
        state.hskSession = {
            difficulty,
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: new Array(CONFIG.HSK.QUESTIONS_PER_SESSION).fill(null),
            score: 0,
            startTime: new Date(),
            timerInterval: null
        };
        
        // Get unanswered questions for this difficulty
        const answeredQuestions = Array.from(state.progress.answeredQuestions[difficulty]);
        const availableQuestions = HSK_QUESTIONS[difficulty].filter(q => !answeredQuestions.includes(q.id));
        
        // If we don't have enough unanswered questions, use any questions
        let questionsToUse = availableQuestions;
        if (availableQuestions.length < CONFIG.HSK.QUESTIONS_PER_SESSION) {
            questionsToUse = HSK_QUESTIONS[difficulty];
            console.log(`Not enough unanswered questions for ${difficulty}. Using any questions.`);
        }
        
        // Select random questions
        state.hskSession.questions = Utils.getRandomQuestions(
            questionsToUse,
            CONFIG.HSK.QUESTIONS_PER_SESSION
        );
        
        // Update UI
        HSKManager.updateDifficultyUI(difficulty);
        NavigationManager.showHSKSection('quiz-session');
        HSKManager.loadQuestion();
        HSKManager.startTimer();
        
        // Increment session count
        state.progress.totalSessions++;
        ProgressManager.saveProgress();
        ProgressManager.updateAllProgressUI();
    }
    
    static updateDifficultyUI(difficulty) {
        const displayName = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        if (elements.hsk.currentDifficulty) {
            elements.hsk.currentDifficulty.textContent = displayName;
        }
        
        if (elements.hsk.difficultyBadge) {
            elements.hsk.difficultyBadge.className = `difficulty-badge ${difficulty}`;
        }
        
        if (elements.hsk.resultsDifficulty) {
            elements.hsk.resultsDifficulty.textContent = displayName;
        }
    }
    
    static loadQuestion() {
        const session = state.hskSession;
        const questionIndex = session.currentQuestionIndex;
        const question = session.questions[questionIndex];
        
        if (!question) return;
        
        // Update progress
        if (elements.hsk.currentQuestion) {
            elements.hsk.currentQuestion.textContent = questionIndex + 1;
        }
        
        if (elements.hsk.quizProgressFill) {
            const progressPercent = ((questionIndex) / CONFIG.HSK.QUESTIONS_PER_SESSION) * 100;
            elements.hsk.quizProgressFill.style.width = `${progressPercent}%`;
        }
        
        // Update question info
        if (elements.hsk.questionType) {
            elements.hsk.questionType.textContent = question.type;
        }
        
        if (elements.hsk.questionText) {
            elements.hsk.questionText.textContent = question.question;
        }
        
        // Clear and add options
        if (elements.hsk.optionsContainer) {
            elements.hsk.optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.innerHTML = `
                    <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                    <div class="option-text">${option}</div>
                `;
                
                optionElement.addEventListener('click', () => HSKManager.selectOption(optionElement, index));
                elements.hsk.optionsContainer.appendChild(optionElement);
            });
        }
        
        // Reset next button
        if (elements.hsk.nextQuestionBtn) {
            elements.hsk.nextQuestionBtn.disabled = true;
            elements.hsk.nextQuestionBtn.innerHTML = questionIndex === CONFIG.HSK.QUESTIONS_PER_SESSION - 1 
                ? 'See Results <i class="fas fa-trophy"></i>' 
                : 'Next Question <i class="fas fa-arrow-right"></i>';
        }
        
        // Highlight previously selected answer
        const previousAnswer = session.userAnswers[questionIndex];
        if (previousAnswer !== null && elements.hsk.optionsContainer) {
            const options = elements.hsk.optionsContainer.querySelectorAll('.option');
            if (options[previousAnswer]) {
                options[previousAnswer].classList.add('selected');
                if (elements.hsk.nextQuestionBtn) {
                    elements.hsk.nextQuestionBtn.disabled = false;
                }
            }
        }
    }
    
    static selectOption(optionElement, selectedIndex) {
        // Deselect all options
        const allOptions = document.querySelectorAll('.option');
        allOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Select clicked option
        optionElement.classList.add('selected');
        
        // Store user's answer
        state.hskSession.userAnswers[state.hskSession.currentQuestionIndex] = selectedIndex;
        
        // Enable next button
        if (elements.hsk.nextQuestionBtn) {
            elements.hsk.nextQuestionBtn.disabled = false;
        }
    }
    
    static handleNextQuestion() {
        const session = state.hskSession;
        const questionIndex = session.currentQuestionIndex;
        const userAnswer = session.userAnswers[questionIndex];
        const correctAnswer = session.questions[questionIndex].correct;
        
        // Check if answer is correct
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            session.score++;
            
            // Add points
            ProgressManager.addPoints(CONFIG.POINTS.CORRECT_ANSWER);
            
            // Add question to answered set
            const questionId = session.questions[questionIndex].id;
            ProgressManager.addAnsweredQuestion(session.difficulty, questionId);
        }
        
        // Update correct count display
        if (elements.hsk.quizCorrect) {
            elements.hsk.quizCorrect.textContent = session.score;
        }
        
        // Move to next question or show results
        session.currentQuestionIndex++;
        
        if (session.currentQuestionIndex < CONFIG.HSK.QUESTIONS_PER_SESSION) {
            HSKManager.loadQuestion();
        } else {
            HSKManager.showResults();
        }
    }
    
    static startTimer() {
        if (state.hskSession.timerInterval) {
            clearInterval(state.hskSession.timerInterval);
        }
        
        state.hskSession.timerInterval = setInterval(() => {
            if (elements.hsk.quizTimer) {
                const elapsed = Math.floor((new Date() - state.hskSession.startTime) / 1000);
                elements.hsk.quizTimer.textContent = Utils.formatTime(elapsed);
            }
        }, 1000);
    }
    
    static stopTimer() {
        if (state.hskSession.timerInterval) {
            clearInterval(state.hskSession.timerInterval);
            state.hskSession.timerInterval = null;
        }
    }
    
    static showResults() {
        HSKManager.stopTimer();
        
        const session = state.hskSession;
        const elapsed = Math.floor((new Date() - session.startTime) / 1000);
        
        // Calculate final score
        const finalScore = session.score;
        const percentage = (finalScore / CONFIG.HSK.QUESTIONS_PER_SESSION) * 100;
        
        // Update results UI
        if (elements.hsk.finalScore) {
            elements.hsk.finalScore.querySelector('.score-number').textContent = finalScore;
        }
        
        if (elements.hsk.resultsCorrect) {
            elements.hsk.resultsCorrect.textContent = finalScore;
        }
        
        if (elements.hsk.resultsTime) {
            elements.hsk.resultsTime.textContent = Utils.formatTime(elapsed);
        }
        
        if (elements.hsk.resultsPoints) {
            elements.hsk.resultsPoints.textContent = `+${finalScore}`;
        }
        
        // Show baby message
        if (elements.hsk.babyMessage) {
            if (percentage >= CONFIG.HSK.SCORE_THRESHOLDS.HIGH * 10) {
                elements.hsk.babyMessage.textContent = "baby is glad to hear that";
                elements.hsk.babyMessage.style.color = '#4CAF50';
            } else if (percentage <= CONFIG.HSK.SCORE_THRESHOLDS.LOW * 10) {
                elements.hsk.babyMessage.textContent = "baby is sad";
                elements.hsk.babyMessage.style.color = '#f44336';
            } else {
                elements.hsk.babyMessage.textContent = "";
            }
        }
        
        // Check if all questions answered
        const totalAnswered = Array.from(state.progress.answeredQuestions.easy).length +
                            Array.from(state.progress.answeredQuestions.medium).length +
                            Array.from(state.progress.answeredQuestions.hard).length;
        
        if (totalAnswered >= 300) {
            // All questions answered
            if (state.progress.totalPoints >= 295) {
                NotificationSystem.showNotification(
                    'All Questions Complete! 😍',
                    'Wow! Now you are able to hangout with baby!',
                    'achievement'
                );
            } else {
                NotificationSystem.showNotification(
                    'All Questions Complete! 😥',
                    'Sorry, you can\'t hangout with baby...',
                    'info'
                );
            }
        }
        
        // Add history event
        Utils.addHistoryEvent(
            'HSK Session Complete',
            `Scored ${finalScore}/10 in ${session.difficulty} mode`
        );
        
        // Show results screen
        NavigationManager.showHSKSection('results-screen');
    }
    
    static exitQuiz() {
        if (confirm('Are you sure you want to exit this session? Your progress will be lost.')) {
            HSKManager.stopTimer();
            HSKManager.showDifficultySelection();
        }
    }
    
    static retrySession() {
        if (state.hskSession.difficulty) {
            HSKManager.startNewSession(state.hskSession.difficulty);
        }
    }
    
    static showDifficultySelection() {
        NavigationManager.showHSKSection('difficulty-selection');
        ProgressManager.updateAnsweredQuestionsUI();
    }
}

// ========== INITIALIZATION ==========
class AppInitializer {
    static init() {
        // Initialize all systems
        ThemeManager.init();
        NotificationSystem.loadNotifications();
        ProgressManager.init();
        NavigationManager.init();
        LoginSystem.init();
        WelcomeScreen.init();
        HSKManager.init();
        
        // Setup notification bell
        if (elements.notificationBell) {
            elements.notificationBell.addEventListener('click', () => {
                elements.notificationDropdown.classList.toggle('show');
            });
        }
        
        if (elements.clearNotifications) {
            elements.clearNotifications.addEventListener('click', (e) => {
                e.stopPropagation();
                NotificationSystem.clearAllNotifications();
            });
        }
        
        // Close notification dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.notificationBell?.contains(e.target) && 
                !elements.notificationDropdown?.contains(e.target)) {
                elements.notificationDropdown?.classList.remove('show');
            }
        });
        
        // Close popup notification
        const popupClose = elements.notificationPopup?.querySelector('.popup-close');
        if (popupClose) {
            popupClose.addEventListener('click', () => {
                elements.notificationPopup.classList.remove('show');
            });
        }
        
        // Show first time notification
        if (state.progress.totalSessions === 0) {
            setTimeout(() => {
                NotificationSystem.showNotification(
                    'Welcome to Lory\'s Zone! ✨',
                    'Start your first HSK session to earn points and unlock achievements!',
                    'info'
                );
            }, 1000);
        }
        
        console.log('✨ Lory\'s Zone initialized successfully!');
    }
}

// ========== START THE APPLICATION ==========
document.addEventListener('DOMContentLoaded', AppInitializer.init);