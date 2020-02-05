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
        "nextWord": headWord[0].original,
        "total_score": total[0].total_score,
        "wordCorrectCount": headWord[0].correct_count,
        "wordIncorrectCount": headWord[0].incorrect_count,
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
    console.log(wordList.head.value);
    const guess = req.body.guess 
    const wordId = req.body.id 
    let { translation, memory_value } = wordList.head.value
    
    console.log(guess);
    console.log(wordId);
    console.log(answer);

    if (guess === translation) {
      //post to the DB and add to correct amount
      //post to the DB and update memory value
       
      const correctData = await LanguageService.correctAnswer(
        req.app.get('db'),
        wordId, memory_value
      )
      console.log(correctData);
      //post to the DB and add to total
      const total = await LanguageService.addToTotal(
        req.app.get('db'),
        req.language.id
      )
      //Shift the word within the linkedlist
      // wordList.insertAt(item, position)
      //return correct message
      let correctObj = 
        {
          "nextWord": correctData[0].next,
          "wordCorrectCount": correctData[0].correct_count,
          "wordIncorrectCount": correctData[0].incorrect_count,
          "totalScore": total[0].total_score,
          "answer": correctData[0].translation,
          "isCorrect": true
        }
        res.send(correctObj);
      } else {
      res.send('end of the code block')
      //post to the DB and add to incorrect amount
      //post to the DB and update memory value
      //shift the word within the linkedlist
      //return incorrect message
    }
    
  })


module.exports = languageRouter
