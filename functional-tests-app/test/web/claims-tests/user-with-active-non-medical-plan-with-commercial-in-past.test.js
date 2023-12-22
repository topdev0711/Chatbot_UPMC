import { user } from '../../../services/user.service.js';
import { validate } from '../../../services/validator.service.js';
import { environmentVariables } from '../../../env.variables.js';
import { collector } from '../../../services/data-collector-service.js';
import { builder } from '../../../services/answer-builders/claims.builder.js';
import { randomizer } from '../../../services/question-randomizer.service.js'
import * as questions from '../../../test-data/questions/claims-questions.test-data.js';
import * as postSchema from '../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../test-data/schemas/claims.schemas.js';


let userData;
let userId; 
const claimsRandomQuestion = randomizer.getRandomQuestion(questions.claimsQuestionsArray);

suite('Claims Tests: user with active Non Medical plan with Commercial in past', function () {

    suiteSetup(async function () {
        userId = environmentVariables.user.chatbotsamnonmed;
        userData = await collector.getData(userId, ['dependentEligibility']);      
        await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
    });

    test(claimsRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.claimsAnswer(userData, 'claims/eob');
        const postMessage = await user.conversation.postMessage(claimsRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.claimsAnswer);
        validate.answer(getAnswer.answer, expectedAnswer.answer);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
