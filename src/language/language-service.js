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
  getHead(db, language_id){
    return db
      .from('word')
      .where('language_id', language_id)
      .first('id',
      'language_id',
      'original',
      'translation',
      'next',
      'memory_value',
      'correct_count',
      'incorrect_count');
  },

  moveHead(db, head) {
    return db
      .from('language')
      .where('head', head)
      .increment('head', 1)
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
      .where('language_id', language_id)
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

  createWordList: async (db, head) => {
    let wordList = new LL();
    let firstWord = await LanguageService.getSpecificWord(db, head);
    firstWord = firstWord[0];
    wordList.insertFirst(firstWord);
    let currentWord = await LanguageService.getSpecificWord(db, firstWord.next);
    currentWord = currentWord[0];

    while (currentWord) {
      wordList.insertLast(currentWord);
      currentWord = await LanguageService.getSpecificWord(db, currentWord.next);
      currentWord = currentWord[0];
    }
    return wordList; 
  },

  changeNext(db, beforeId, nextId) {
    return db
    .from('word')
    .where('id', beforeId)
    .update('next', nextId);
  },

  moveBack: async (db, word_id, memory, wordList, language_id) => {
    let nodeBefore = wordList.head;
    let wordsArr = await LanguageService.getLanguageWords(db, language_id);
    let length = wordsArr.length;
    
    if (memory >= length) {
      console.log('memory too much')
      while (nodeBefore.next) {
        nodeBefore = nodeBefore.next;
      }
      console.log(nodeBefore);
      await LanguageService.changeNext(db, nodeBefore.value.id, word_id);
      await LanguageService.changeNext(db, word_id, null);
      return;
    }

    for(let i=0; i < memory; i++) {
      nodeBefore = nodeBefore.next;
    }
    let nextId = nodeBefore.next.value.id;
    await LanguageService.changeNext(db, nodeBefore.value.id, word_id);
    await LanguageService.changeNext(db, word_id, nextId);
    return;
  }

};



module.exports = LanguageService;
