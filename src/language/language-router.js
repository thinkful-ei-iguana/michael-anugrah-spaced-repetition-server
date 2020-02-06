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
  // .use(async (req, res, next) => {
  //   try {
  //     let wordList = await LanguageService.createWordList(req.app.get('db'), req.language.head)
  //     // console.log('wordList ln35: ', wordList);
  //     req.list = wordList
  //     // console.log('req.list ln37', req.list);
  //     next()
  //   } catch(error) {
  //     next(error)
  //   }
  // })

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
      let head = await LanguageService.getHead(req.app.get('db'), req.language.id);
      let total = await LanguageService.getTotal(
        req.app.get('db'),
        req.language.id
      )
      total = total[0];

      const headObj = {
        "nextWord": head.original,
        "total_score": total.total_score,
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
    let head = await LanguageService.getSpecificWord(req.app.get('db'), req.language.head);
    head = head[0];
    console.log(head);
          //////  CORRECT //////////
    if(req.body.guess === head.nextWord) {
      

    } else {
      ///update head
      LanguageService.moveHead(req.app.get('db'), req.language.head)
    }

          ////// INCORRECT /////////
    //Need to call on a method to create a new linkedlist 
    //this linkedlist will be based off of DB
    //order of linked list will be based off of next value -> id
    //after each guess, we need to update next value of that word
    //iterate through linked list M amount times (m = memory_value)
    // find the id of the word at M position,
    // set the current word's next value as that id in the DB
    // set the head value in language table as the current next value

  //   let list = req.list;
  //   const guess = req.body.guess 
  //   //const wordId = req.body.id 
  //   let { translation, memory_value, id } = list.head.value
    
  //   //console.log('user guess: ', guess);
  //   //console.log('id from req.body: ', wordId);
  //  // console.log('from wordList.head: ', translation);
  //   if (!req.body.guess) {
  //     return res.status(400).json({
  //       error: "Missing 'guess' in request body",
  //     })
  //   }
  //   if (guess === translation) {
  //     //post to the DB and add to correct amount
  //     //post to the DB and update memory value
       
  //     try {
  //       let wordsArr = await LanguageService.getLanguageWords(req.app.get('db'), req.language.id);
  //       let length = wordsArr.length;

  //       let correctData = await LanguageService.correctAnswer(
  //       req.app.get('db'),
  //       id, memory_value
  //       );
  //       correctData = correctData[0];

  //     //post to the DB and add to total
  //       let total = await LanguageService.addToTotal(
  //         req.app.get('db'),
  //         req.language.id
  //       );
  //       total = total[0];
        
  //       //return correct message

  //       //Shift the word within the linkedlist
  //       let position = (correctData.memory_value % length);
  //       // console.log('how much to move: ', position)
  //       let item = list.head.value;
  //       // console.log('to be removed: ', item);
  //       list.remove(item);
  //       // console.log('remove item: ', list);
  //       list.insertAt(item, position + 1);
  //       req.list = list;
  //       // console.log('updated list: ', req.list);

  //       let correctObj = 
  //       {
  //         "nextWord": req.list.head.value.original,
  //         "wordCorrectCount": correctData.correct_count,
  //         "wordIncorrectCount": correctData.incorrect_count,
  //         "totalScore": total,
  //         "answer": correctData.translation,
  //         "isCorrect": true,
  //       } 

        

  //       res.send(correctObj);
  //     } 
  //     catch (error) {
  //         next(error)
  //       }
  //   } 
  //   else {
  //     try {
  //       //post to the DB and add to incorrect amount
  //       //post to the DB and update memory value
  //       const incorrectData = await LanguageService.incorrectAnswer(
  //         req.app.get('db'),
  //         id
  //         );

  //       let total = await LanguageService.getTotal(
  //         req.app.get('db'),
  //         req.language.id
  //       )
  //         console.log('this is total:', total);
          
  //         //return incorrect message
  //         let incorrectObj = 
  //         {
  //           "nextWord": wordList.head.next.value.original,
  //           "wordCorrectCount": incorrectData[0].correct_count,
  //           "wordIncorrectCount": incorrectData[0].incorrect_count,
  //           "totalScore": total[0].total_score,
  //           "answer": incorrectData[0].translation,
  //           "isCorrect": false,
  //         }
          
  //         //shift the word within the linkedlist
  //         let position = incorrectData[0].memory_value;
  //         let item = wordList.head.value;
  //         wordList.remove(item);
  //         wordList.insertAt(item, position);

  //         res.send(incorrectObj)
  //     }
  //     catch (error) {
  //       next(error)
  //     }
  //     }
    
  })


module.exports = languageRouter
