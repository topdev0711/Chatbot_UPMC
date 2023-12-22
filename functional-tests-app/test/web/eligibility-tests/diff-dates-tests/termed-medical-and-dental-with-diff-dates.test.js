import { user } from '../../../../services/user.service.js';
import { validate } from '../../../../services/validator.service.js';
import { environmentVariables } from '../../../../env.variables.js';
import { collector } from '../../../../services/data-collector-service.js';
import { builder } from '../../../../services/answer-builders/eligibility.builder.js';
import { randomizer } from '../../../../services/question-randomizer.service.js';
import * as questions from '../../../../test-data/questions/eligibility-questions.test-data.js';
import * as postSchema from '../../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../../test-data/schemas/eligibility.schemas.js';


let userData;
let userId; 
const generalEligibilityRandomQuestion = randomizer.getRandomQuestion(questions.generalEligibilityQuestionsArray);
const dentalEligibilityRandomQuestion = randomizer.getRandomQuestion(questions.dentalEligibilityQuestionsArray);
const visionEligibilityRandomQuestion = randomizer.getRandomQuestion(questions.visionEligibilityQuestionsArray);
const wellnessEligibilityRandomQuestion = randomizer.getRandomQuestion(questions.wellnessEligibilityQuestionsArray);

suite('Eligibility Tests: Termed medical with dental coverages with different dates', function () {

    suiteSetup(async function () {
        userId = environmentVariables.user.joneb4808;
        userData = await collector.getData(userId, ['eligibility']);      
        await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
    });

    test(generalEligibilityRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.eligibilityAnswer(userData, generalEligibilityRandomQuestion.text, 'termed');
        const postMessage = await user.conversation.postMessage(generalEligibilityRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.eligibilityAnswer);
        validate.answer(getAnswer.answer, expectedAnswer.answer);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    test(dentalEligibilityRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.eligibilityAnswer(userData, dentalEligibilityRandomQuestion.text, 'termed');
        const postMessage = await user.conversation.postMessage(dentalEligibilityRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.eligibilityAnswer);
        validate.answer(getAnswer.answer, expectedAnswer.answer);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    test(visionEligibilityRandomQuestion.text, async function () {
    
        const expectedAnswer = await builder.eligibilityAnswer(userData, visionEligibilityRandomQuestion.text, 'termed');
        const postMessage = await user.conversation.postMessage(visionEligibilityRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.eligibilityAnswer);
        validate.answer(getAnswer.answer, expectedAnswer.answer);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    test(wellnessEligibilityRandomQuestion.text, async function () {
        
        const expectedAnswer = await builder.eligibilityAnswer(userData, wellnessEligibilityRandomQuestion.text, 'termed');
        const postMessage = await user.conversation.postMessage(wellnessEligibilityRandomQuestion, userData.consumerProfile, this);
        
        validate.statusCode(postMessage.response.status, 200);
        validate.jsonSchema(postMessage.json, postSchema.postMessage);
        validate.done();
        
        const getAnswer = await user.conversation.getActivity(postMessage.json.id);
        
        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.eligibilityAnswer);
        validate.answer(getAnswer.answer, expectedAnswer.answer);
        validate.followUpQuestions(getAnswer.followUpQuestion, expectedAnswer.followUpQuestion);
        validate.done();
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
