const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LL = require('../list/LL');

const languageRouter = express.Router()
const BodyParser = express.json();

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
      let head = await LanguageService.getHead(
        req.app.get('db'), 
        req.language.id,
        req.language.head
        );
      
      let total = await LanguageService.getTotal(
        req.app.get('db'),
        req.language.id
        );
      total = total[0];

      const headObj = {
        "nextWord": head.original,
        "totalScore": total.total_score,
        "wordCorrectCount": head.correct_count,
        "wordIncorrectCount": head.incorrect_count,
      }

      res.send(headObj);
      next()  
    }
    catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    if(!req.body.guess) {
      return res.status(400)
      .json({
              error: "Missing 'guess' in request body",
            })
    }

    let wordList = await LanguageService.createWordList(
        req.app.get('db'),
        req.language.head);

    const guess = req.body.guess
    let { translation, memory_value, id} = wordList.head.value
          //////  CORRECT //////////
    if(req.body.guess === translation) {
        try {
        //post to the DB and add to correct amount
        //post to the DB and update memory value
          let correctData = await LanguageService.correctAnswer(
            req.app.get('db'),
            id, memory_value
            );
          correctData = correctData[0];
          let nextData = await LanguageService.getSpecificWord(
            req.app.get('db'),
            wordList.head.value.next
          )
          nextData = nextData[0];

        //post to the DB and add to total
          let total = await LanguageService.addToTotal(
            req.app.get('db'),
            req.language.id
            );
          total = total[0];
        //post to the DB and adjust the next value based off of memory value
          await LanguageService.moveBack(
            req.app.get('db'),
            id,
            memory_value,
            wordList,
            req.language.id
          );
        //return correct message
          let correctObj = 
            {
              "nextWord": wordList.head.next.value.original,
              "wordCorrectCount": nextData.correct_count,
              "wordIncorrectCount": nextData.incorrect_count,
              "totalScore": total,
              "answer": correctData.translation,
              "isCorrect": true,
            } 
          res.send(correctObj);
        }
        catch (error) {
          next(error)
        }
    }  
      //   IF ANSWER INCORRECT
      else {
      try {

        console.log('we made it!');
        //post to the DB and add to incorrect amount
        //post to the DB and update memory value
          let incorrectData = await LanguageService.incorrectAnswer(
            req.app.get('db'),
            id
            );
          incorrectData = incorrectData[0];

          let nextData = await LanguageService.getSpecificWord(
            req.app.get('db'),
            wordList.head.value.next
          )
          nextData = nextData[0];

        //post to the DB and adjust the next value based off of memory value
          await LanguageService.moveBack(
            req.app.get('db'),
            id,
            0,
            wordList,
            req.language.id
          );

          let total = await LanguageService.getTotal(
            req.app.get('db'),
            req.language.id
          );
        //return correct message
          let incorrectObj = 
            {
              "nextWord": wordList.head.next.value.original,
              "wordCorrectCount": nextData.correct_count,
              "wordIncorrectCount": nextData.incorrect_count,
              "totalScore": total[0].total_score,
              "answer": incorrectData.translation,
              "isCorrect": false,
            } 
          res.send(incorrectObj);
      }
      catch (error) {}
    }
    
  })

module.exports = languageRouter
