import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define translations directly to avoid import issues
const en = {
  "app": {
    "title": "IdeaHub",
    "subtitle": "Collaborative Idea Management Platform"
  },
  "auth": {
    "welcome": "Welcome to IdeaHub",
    "subtitle": "Collaborative Idea Management Platform",
    "signIn": "Sign In",
    "signingIn": "Signing in...",
    "backendInfo": "Node.js backend with secure authentication",
    "demoNote": "Demo login for testing purposes"
  },
  "navigation": {
    "ideas": "Ideas",
    "clients": "Clients",
    "pipeline": "Pipeline",
    "contacts": "Contacts",
    "dashboard": "Dashboard",
    "recommendations": "Recommendations",
    "products": "Products",
    "tasks": "Tasks",
    "calendar": "Calendar",
    "rates": "Rates",
    "calculator": "Calculator",
    "sidebarDescription": "Navigate through idea management system"
  },
  "hero": {
    "totalIdeas": "Total Ideas",
    "activeUsers": "Active Users",
    "thisMonth": "This Month",
    "welcomeBack": "Welcome back!",
    "manageIdeas": "Here you can manage and track all ideas",
    "addNewIdea": "Add New Idea"
  },
  "filters": {
    "search": "Search ideas...",
    "sortBy": "Sort by",
    "newest": "Newest",
    "oldest": "Oldest",
    "mostVoted": "Most Voted",
    "leastVoted": "Least Voted",
    "gridView": "Grid View",
    "listView": "List View"
  },
  "idea": {
    "createTitle": "Add New Idea",
    "createDescription": "Share your idea with the team. Add description, images and tags for better understanding.",
    "title": "Title",
    "titlePlaceholder": "Enter idea title",
    "description": "Description",
    "descriptionPlaceholder": "Describe your idea in detail...",
    "images": "Images",
    "addImages": "Add Images",
    "published": "Published",
    "attachedImages": "Attached Images",
    "overallRating": "overall rating",
    "comments": "comments",
    "noComments": "No comments yet. Be the first!",
    "writeComment": "Write a comment...",
    "addComment": "Add Comment",
    "posting": "Posting...",
    "creating": "Creating...",
    "addIdea": "Add Idea",
    "ideaNotFound": "Idea not found",
    "noIdeasFound": "No ideas found",
    "beFirstToSuggest": "Be the first to suggest an idea!",
    "suggestIdea": "Suggest Idea"
  },
  "actions": {
    "cancel": "Cancel",
    "loading": "Loading...",
    "tryNow": "Try Now"
  },
  "messages": {
    "ideaCreated": "Idea Created!",
    "ideaCreatedSuccess": "Your idea has been successfully added.",
    "commentPosted": "Your comment has been posted!",
    "error": "Error",
    "createIdeaError": "Failed to create idea. Please try again.",
    "voteError": "Failed to vote. Please try again.",
    "commentError": "Failed to post comment. Please try again."
  },
  "mobile": {
    "title": "Mobile Version",
    "description": "Manage ideas anywhere"
  },
  "notFound": {
    "title": "404 Page Not Found",
    "description": "The requested page does not exist."
  },
  "language": {
    "switchTo": "Switch to {{language}}"
  }
};

const ru = {
  "app": {
    "title": "IdeaHub",
    "subtitle": "Платформа для совместного управления идеями"
  },
  "auth": {
    "welcome": "Добро пожаловать в IdeaHub",
    "subtitle": "Платформа для совместного управления идеями",
    "signIn": "Войти в систему",
    "signingIn": "Входим...",
    "backendInfo": "Node.js backend с безопасной аутентификацией",
    "demoNote": "Демо-вход для тестирования"
  },
  "navigation": {
    "ideas": "Идеи",
    "clients": "Клиенты",
    "pipeline": "Воронка",
    "contacts": "Контакты",
    "dashboard": "Панель",
    "recommendations": "Рекомендации",
    "products": "Продукты",
    "tasks": "Задачи",
    "calendar": "Календарь",
    "rates": "Тарифы",
    "calculator": "Калькулятор",
    "sidebarDescription": "Навигация по системе управления идеями"
  },
  "hero": {
    "totalIdeas": "Всего идей",
    "activeUsers": "Активных пользователей",
    "thisMonth": "В этом месяце",
    "welcomeBack": "С возвращением!",
    "manageIdeas": "Здесь вы можете управлять и отслеживать все идеи",
    "addNewIdea": "Добавить новую идею"
  },
  "filters": {
    "search": "Поиск идей...",
    "sortBy": "Сортировать по",
    "newest": "Новейшие",
    "oldest": "Старейшие",
    "mostVoted": "Наиболее оцененные",
    "leastVoted": "Наименее оцененные",
    "gridView": "Вид сетки",
    "listView": "Вид списка"
  },
  "idea": {
    "createTitle": "Добавить новую идею",
    "createDescription": "Поделитесь своей идеей с командой. Добавьте описание, изображения и теги для лучшего понимания.",
    "title": "Заголовок",
    "titlePlaceholder": "Введите заголовок идеи",
    "description": "Описание",
    "descriptionPlaceholder": "Опишите вашу идею подробно...",
    "images": "Изображения",
    "addImages": "Добавить изображения",
    "published": "Опубликовано",
    "attachedImages": "Приложенные изображения",
    "overallRating": "общий рейтинг",
    "comments": "комментариев",
    "noComments": "Пока нет комментариев. Будьте первым!",
    "writeComment": "Написать комментарий...",
    "addComment": "Добавить комментарий",
    "posting": "Отправляем...",
    "creating": "Создаем...",
    "addIdea": "Добавить идею",
    "ideaNotFound": "Идея не найдена",
    "noIdeasFound": "Идеи не найдены",
    "beFirstToSuggest": "Будьте первым, кто предложит идею!",
    "suggestIdea": "Предложить идею"
  },
  "actions": {
    "cancel": "Отмена",
    "loading": "Загрузка...",
    "tryNow": "Попробовать сейчас"
  },
  "messages": {
    "ideaCreated": "Идея создана!",
    "ideaCreatedSuccess": "Ваша идея успешно добавлена.",
    "commentPosted": "Ваш комментарий опубликован!",
    "error": "Ошибка",
    "createIdeaError": "Не удалось создать идею. Попробуйте снова.",
    "voteError": "Не удалось проголосовать. Попробуйте снова.",
    "commentError": "Не удалось опубликовать комментарий. Попробуйте снова."
  },
  "mobile": {
    "title": "Мобильная версия",
    "description": "Управляйте идеями везде"
  },
  "notFound": {
    "title": "404 Страница не найдена",
    "description": "Запрашиваемая страница не существует."
  },
  "language": {
    "switchTo": "Переключить на {{language}}"
  }
};

const resources = {
  en: {
    translation: en
  },
  ru: {
    translation: ru
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  });

export default i18n;