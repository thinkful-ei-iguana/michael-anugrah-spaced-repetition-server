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
      .first('original',
        'correct_count',
        'incorrect_count')
      .where({ language_id });
  },

  correctAnswer(db, word_id, memory_value) {
    return db
      .from('word')
      .increment('memory_value', memory_value)
      .increment('correct_count', 1)
      .select('*')
      .where('id', word_id);
  },

  

  incorrectAnswer() {

  },

  addToTotal(db, language_id) {
    return db 
      .returning(
        'total_score'
      )
      .update('language')
      .where({ language_id })
      .increment('total_score', 1);
  } 



};

module.exports = LanguageService;
