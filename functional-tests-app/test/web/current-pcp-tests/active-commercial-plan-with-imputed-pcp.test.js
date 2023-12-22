import { user } from '../../../services/user.service.js';
import { validate } from '../../../services/validator.service.js';
import { environmentVariables } from '../../../env.variables.js';
import { collector } from '../../../services/data-collector-service.js';
import { builder } from '../../../services/answer-builders/current-pcp.builder.js';
import { randomizer } from '../../../services/question-randomizer.service.js'
import * as questions from '../../../test-data/questions/current-pcp-questions.test-data.js';
import * as postSchema from '../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../test-data/schemas/current-pcp.schemas.js';


let userData;
let userId; 
const currentPcpRandomQuestion = randomizer.getRandomQuestion(questions.currentPcpQuestionsArray);

suite('PCP Tests: Active Commercial plan with Imputed PCP', function () {

    suiteSetup(async function () {
        userId = environmentVariables.user.dilljon;
        userData = await collector.getData(userId, ['pcp']);      
        await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
    });

    test(currentPcpRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.currentPcpAnswer(userData, 'active/future', 'imputed pcp', environmentVariables.domain);
        const postMessage = await user.conversation.postMessage(currentPcpRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.currentPcpAnswer);
        validate.answer(getAnswer.answersArray[0], expectedAnswer.answer[0]);
        validate.answer(getAnswer.answersArray[1], expectedAnswer.answer[1]);
        validate.answer(getAnswer.answersArray[2], expectedAnswer.answer[2]);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
