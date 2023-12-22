import { user } from '../../../services/user.service.js';
import { validate } from '../../../services/validator.service.js';
import { environmentVariables } from '../../../env.variables.js';
import { collector } from '../../../services/data-collector-service.js';
import { builder } from '../../../services/answer-builders/hia-submission-form.builder.js';
import { randomizer } from '../../../services/question-randomizer.service.js';
import * as questions from '../../../test-data/questions/hia-submission-form-questions.test-data.js';
import * as postSchema from '../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../test-data/schemas/hia-submission-form.schemas.js';


let userData;
let userId; 
const hiaSubmissionFormRandomQuestion = randomizer.getRandomQuestion(questions.hiaSubmissionFormQuestionsArray);

suite('HIA Submission Assessments Tests: Active Commercial plan + HIA + corpId = J527', function () {

    suiteSetup(async function () {
        userId = environmentVariables.user.austin;
        userData = await collector.getData(userId, ['eligibility', 'forms']);      
        await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
    });

    test(hiaSubmissionFormRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.hiaSubmissionFormAnswer(userData, 'hia form');
        const postMessage = await user.conversation.postMessage(hiaSubmissionFormRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.hiaSubmissionFormAnswer);
        validate.answer(getAnswer.answersArray[0], expectedAnswer.answer[0]);
        validate.answer(getAnswer.answersArray[1], expectedAnswer.answer[1]);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
