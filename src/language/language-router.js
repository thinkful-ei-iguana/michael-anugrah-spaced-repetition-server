const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LL = require('../list/LL');

const languageRouter = express.Router()

let wordList = new LL();

languageRouter
  .use(requireAuth)
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
    console.log(req.query)
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
      wordsArr.map(w => wordList.insertLast(w));
      res.send(headObj);
      next()  
    }
    catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    try{
    const guess = req.query.guess 
    const wordId = req.query.id 
    let answer = wordList.head.translation

    if (guess === answer) {
      //post to the DB and add to correct amount
      //post to the DB and update memory value
      const correctData = await LanguageService.correctAnswer(
        req.app.get('db'),
        wordId
      )
      //post to the DB and add to total
      const total = await LanguageService.addToTotal(
        req.app.get('db'),
        req.language.id
      )
      //Shift the word within the linkedlist
      wordList.insertAt()
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
      }

      else {
        res.send('implement me!')
        //post to the DB and add to incorrect amount
        //post to the DB and update memory value
        //shift the word within the linkedlist
        //return incorrect message
      }
    }
    catch (error) {
      next(error)
    }
  })


module.exports = languageRouter
