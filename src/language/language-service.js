const LL = require('../list/LL');

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
      .select('total_score')
      .where( 'id', language_id);
  },

  startPractice(db, language_id) {
    return db
      .from('word')
      .where({ language_id })
      .first(
        'original',
        'correct_count',
        'incorrect_count');
  },

  correctAnswer(db, word_id, memory_value) {
    return db
      .from('word')
      .where('id', word_id)
      .increment('memory_value', memory_value)
      .increment('correct_count', 1)
      .returning(
        ['next',
          'correct_count',
          'incorrect_count',
          'translation',
          'memory_value']
      );
  },

  

  incorrectAnswer(db, word_id) {
    return db
      .from('word')
      .where('id', word_id)
      .update('memory_value', 1)
      .increment('incorrect_count', 1)
      .returning(
        ['next',
          'correct_count',
          'incorrect_count',
          'translation',
          'memory_value']
      );

  },

  addToTotal(db, language_id) {
    return db 
      .from('language')
      .where('id', language_id)
      .increment('total_score', 1)
      .returning(
        'total_score'
      );
  }, 

  getSpecificWord(db, id) {
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
    .where('id', id);
  },

  createWordList(db, head) {
    let wordList = new LL();
    let firstWord = this.getSpecificWord(db, head);
    
    while (firstWord.next) {
      let currentWord = this.getSpecificWord(db, firstWord.next);
      wordList.insertLast(currentWord);
      firstWord = currentWord;
    }
    return wordList;
  }



};

module.exports = LanguageService;
