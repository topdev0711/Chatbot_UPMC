import { user } from '../../../services/user.service.js';
import { validate } from '../../../services/validator.service.js';
import { environmentVariables } from '../../../env.variables.js'
import { collector } from '../../../services/data-collector-service.js';
import { builder } from '../../../services/answer-builders/pharmacy.builder.js';
import * as questions from '../../../test-data/questions/pharmacy-questions.test-data.js';
import * as postSchema from '../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../test-data/schemas/pharmacy.schemas.js';


let userData;
let userId; 

suite('Pharmacy Tests: intents recognition', function () {

    suiteSetup(async function () {
        userId = environmentVariables.user.chatphyl;
        userData = await collector.getData(userId, ['eligibility']);
        await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
    });

    questions.pharmacyQuestionsArray.forEach((question) => {
        test(question.text, async function () {
            
            const expectedAnswer = await builder.pharmacyAnswer(userData, 'pmdm', 'chc');
            const postMessage = await user.conversation.postMessage(question, userData.consumerProfile, this);
            
            validate.statusCode(postMessage.response.status, 200);
            validate.jsonSchema(postMessage.json, postSchema.postMessage);
            validate.done();
            
            const getAnswer = await user.conversation.getActivity(postMessage.json.id);
            
            validate.statusCode(getAnswer.response.status, 200);
            validate.jsonSchema(getAnswer.json, answerSchema.pharmacyAnswer);
            validate.answer(getAnswer.answer, expectedAnswer.answer);
            validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
            validate.done();
        });
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
