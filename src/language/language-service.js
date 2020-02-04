const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getTotal(db, language_id) {
    return db 
      .from('language')
      .select(
        'total_score'
      )
      .where( 'id', language_id);
  },

  startPractice(db, language_id) {
    return db
      .from('word')
      .select(
        'original',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id })
      .where('id', 1);
  },

  correctAnswer(db, word_id) {
    return db
      .update('word')
      .where('id', word_id)
      .increment('memory_value', 'memory_value')
      .increment('correct_count', 1)
      .select(
        'next',
        'correct_count',
        'incorrect-count',
        'translation'
      )
      .where('id', word_id);
  },

  incorrectAnswer() {

  },

  addToTotal(db, language_id) {
    return db 
      .update('language')
      .where({ language_id })
      .increment('total_score', 1)
      .select(
        'total_score'
      );
  } 



}

module.exports = LanguageService
