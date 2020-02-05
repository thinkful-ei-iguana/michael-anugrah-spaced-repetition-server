const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LL = require('../list/LL');

const languageRouter = express.Router()
const BodyParser = express.json();

let wordList = new LL();

languageRouter
  .use(requireAuth)
  .use(BodyParser)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const headWord = await LanguageService.startPractice(
        req.app.get('db'),
        req.language.id
      )
      const total = await LanguageService.getTotal(
        req.app.get('db'),
        req.language.id
      )

      const headObj = {
        "nextWord": headWord.original,
        "total_score": total[0].total_score,
        "wordCorrectCount": headWord.correct_count,
        "wordIncorrectCount": headWord.incorrect_count,
      }
      let wordsArr = LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )
      await wordsArr.map(w => wordList.insertLast(w));
      res.send(headObj);
      next()  
    }
    catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    const guess = req.body.guess 
    const wordId = req.body.id 
    let { translation, memory_value } = wordList.head.value
    
    //console.log('user guess: ', guess);
    //console.log('id from req.body: ', wordId);
   // console.log('from wordList.head: ', translation);
    if (!req.body.guess) {
      return res.status(400).json({
        error: "Missing 'guess' in request body",
      })
    }
    if (guess === translation) {
      //post to the DB and add to correct amount
      //post to the DB and update memory value
       
      try {
        const correctData = await LanguageService.correctAnswer(
        req.app.get('db'),
        wordId, memory_value
        );
                //post to the DB and add to total
        const total = await LanguageService.addToTotal(
          req.app.get('db'),
          req.language.id
        );

        //return correct message
        let correctObj = 
        {
          "nextWord": wordList.head.next.value.original,
          "wordCorrectCount": correctData[0].correct_count,
          "wordIncorrectCount": correctData[0].incorrect_count,
          "totalScore": total[0],
          "answer": correctData[0].translation,
          "isCorrect": true
        }
        
        //Shift the word within the linkedlist
        let position = correctData[0].memory_value;
        let item = wordList.head.value;
        wordList.remove(item);
        wordList.insertAt(item, position);

        res.send(correctObj);
      } 
      catch (error) {
          next(error)
        }
    } 
    else {
      try {
        //post to the DB and add to incorrect amount
        //post to the DB and update memory value
        const incorrectData = await LanguageService.incorrectAnswer(
          req.app.get('db'),
          wordId
          );

        let total = await LanguageService.getTotal(
          req.app.get('db'),
          req.language.id
        )
          console.log('this is total:', total);
          
          //return incorrect message
          let incorrectObj = 
          {
            "nextWord": wordList.head.next.value.original,
            "wordCorrectCount": incorrectData[0].correct_count,
            "wordIncorrectCount": incorrectData[0].incorrect_count,
            "totalScore": total[0].total_score,
            "answer": incorrectData[0].translation,
            "isCorrect": false
          }
          
          //shift the word within the linkedlist
          let position = incorrectData[0].memory_value;
          let item = wordList.head.value;
          wordList.remove(item);
          wordList.insertAt(item, position);

          res.send(incorrectObj)
      }
      catch (error) {
        next(error)
      }
      }
    
  })


module.exports = languageRouter
