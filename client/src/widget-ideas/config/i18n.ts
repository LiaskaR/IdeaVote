import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      navigation: {
        ideas: 'Ideas',
        search: 'Search',
      },
      hero: {
        title: 'IdeaHub',
        subtitle: 'Platform for Innovation',
        description: 'Share and vote on ideas to drive your organization forward',
        totalIdeas: 'Total Ideas',
        totalUsers: 'Total Users',
        activeProjects: 'Active Projects',
      },
      ideas: {
        title: 'Submit Your Idea',
        description: 'Share your innovative idea with the community',
        titleLabel: 'Title',
        titlePlaceholder: 'Enter idea title',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Describe your idea in detail',
        submitButton: 'Submit Idea',
        addImages: 'Add Images',
        removeImage: 'Remove Image',
        maxImages: 'Maximum 5 images allowed',
        loadingSubmit: 'Creating...',
        viewDetails: 'View Details',
        comments: 'Comments',
        addComment: 'Add a comment',
        postComment: 'Post Comment',
        loadingComment: 'Posting...',
        noComments: 'No comments yet. Be the first to share your thoughts!',
        tags: 'Tags (comma-separated)',
        tagsPlaceholder: 'innovation, technology, improvement',
      },
      voting: {
        upvote: 'Upvote',
        downvote: 'Downvote',
      },
      filters: {
        sortBy: 'Sort by',
        popular: 'Popular',
        newest: 'Newest',
        oldest: 'Oldest',
        discussed: 'Most Discussed',
        cardView: 'Card View',
        listView: 'List View',
      },
      language: {
        switchTo: 'Switch to {{language}}',
      },
      messages: {
        success: 'Success',
        error: 'Error',
        ideaCreated: 'Your idea has been successfully created!',
        ideaCreateError: 'Failed to create idea. Please try again.',
        voteError: 'Failed to vote. Please try again.',
        commentError: 'Failed to post comment. Please try again.',
        commentSuccess: 'Comment posted successfully!',
      },
      common: {
        cancel: 'Cancel',
        close: 'Close',
        loading: 'Loading...',
        submit: 'Submit',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
      },
      errors: {
        notFound: 'Page Not Found',
        backToHome: 'Back to Home',
      },
    },
  },
  ru: {
    translation: {
      navigation: {
        ideas: 'Идеи',
        search: 'Поиск',
      },
      hero: {
        title: 'IdeaHub',
        subtitle: 'Платформа для инноваций',
        description: 'Делитесь идеями и голосуйте, чтобы двигать организацию вперёд',
        totalIdeas: 'Всего идей',
        totalUsers: 'Всего пользователей',
        activeProjects: 'Активных проектов',
      },
      ideas: {
        title: 'Предложите свою идею',
        description: 'Поделитесь своей инновационной идеей с сообществом',
        titleLabel: 'Название',
        titlePlaceholder: 'Введите название идеи',
        descriptionLabel: 'Описание',
        descriptionPlaceholder: 'Опишите вашу идею подробно',
        submitButton: 'Отправить идею',
        addImages: 'Добавить изображения',
        removeImage: 'Удалить изображение',
        maxImages: 'Максимум 5 изображений',
        loadingSubmit: 'Создание...',
        viewDetails: 'Подробнее',
        comments: 'Комментарии',
        addComment: 'Добавить комментарий',
        postComment: 'Опубликовать',
        loadingComment: 'Публикация...',
        noComments: 'Пока нет комментариев. Будьте первым!',
        tags: 'Теги (через запятую)',
        tagsPlaceholder: 'инновации, технологии, улучшения',
      },
      voting: {
        upvote: 'За',
        downvote: 'Против',
      },
      filters: {
        sortBy: 'Сортировать',
        popular: 'Популярные',
        newest: 'Новые',
        oldest: 'Старые',
        discussed: 'Обсуждаемые',
        cardView: 'Карточки',
        listView: 'Список',
      },
      language: {
        switchTo: 'Переключить на {{language}}',
      },
      messages: {
        success: 'Успешно',
        error: 'Ошибка',
        ideaCreated: 'Ваша идея успешно создана!',
        ideaCreateError: 'Не удалось создать идею. Попробуйте снова.',
        voteError: 'Не удалось проголосовать. Попробуйте снова.',
        commentError: 'Не удалось опубликовать комментарий. Попробуйте снова.',
        commentSuccess: 'Комментарий успешно опубликован!',
      },
      common: {
        cancel: 'Отмена',
        close: 'Закрыть',
        loading: 'Загрузка...',
        submit: 'Отправить',
        save: 'Сохранить',
        delete: 'Удалить',
        edit: 'Редактировать',
        confirm: 'Подтвердить',
      },
      errors: {
        notFound: 'Страница не найдена',
        backToHome: 'На главную',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;