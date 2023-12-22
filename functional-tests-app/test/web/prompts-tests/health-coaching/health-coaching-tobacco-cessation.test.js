import { user } from '../../../../services/user.service.js';
import { validate } from '../../../../services/validator.service.js';
import { environmentVariables } from '../../../../env.variables.js';
import { collector } from '../../../../services/data-collector-service.js';
import { builder } from '../../../../services/answer-builders/prompts.builder.js';
import * as question from '../../../../test-data/questions/prompts-questions.test-data.js';
import * as liveChat from '../../../../test-data/prompts/live-chat.test-data.js';
import * as postSchema from '../../../../test-data/schemas/post-message.schemas.js';
import * as answerSchema from '../../../../test-data/schemas/prompts.schemas.js';


let userData;
let userName;
let userId; 

suite('Prompts Tests: Health Coaching -> Tobacco Cessation', function () {

    suiteSetup(async function () {
        if (environmentVariables.server != 'STAGE') {
            userId = environmentVariables.user.delucat2; 
            userData = await collector.getData(userId, ['liveChatStatus', 'liveChatWorkingHours', 'eligibility', 'benefits', 'idCards', 'spendingAccounts']);
            userName = `${userData.consumerProfile.firstName} ${userData.consumerProfile.lastName}`;
            await user.startChat(userData.userToken, userData.consumerProfile, 'web', this);
        } else {
            this.skip();
        }
    });

    test("Health Coaching -> Tobacco Cessation", async function () {
        
        const expectedAnswer = await builder.promptsAnswer(userData, 'common');
        const getFirstMessage = await user.conversation.getActivity(expectedAnswer.FIRST_MESSAGE_ID);

        validate.statusCode(getFirstMessage.response.status, 200);
        validate.jsonSchema(getFirstMessage.json, answerSchema.greetingMessage);
        validate.answer(getFirstMessage.answer, expectedAnswer.answers.answer);
        validate.buttons(getFirstMessage.buttons, expectedAnswer.promptButtons);
        validate.done();

        const clickFirstLevelPrompt = await user.conversation.postMessage(question.healthCoaching, userData.consumerProfile, this);
            
        validate.statusCode(clickFirstLevelPrompt.response.status, 200);
        validate.jsonSchema(clickFirstLevelPrompt.json, postSchema.postMessage);
        validate.done();

        const getSecondLevelPrompts = await user.conversation.getActivity(clickFirstLevelPrompt.json.id);

        validate.statusCode(getSecondLevelPrompts.response.status, 200);
        validate.jsonSchema(getSecondLevelPrompts.json, answerSchema.subprompts);
        validate.buttons(getSecondLevelPrompts.buttons, expectedAnswer.subPromptButtons.healthCoaching);
        validate.done();

        const clickSecondLevelPrompt = await user.conversation.postMessage(liveChat.tobaccoCessation, userData.consumerProfile, this);
        
        validate.statusCode(clickSecondLevelPrompt.response.status, 200);
        validate.jsonSchema(clickSecondLevelPrompt.json, postSchema.postMessage);
        validate.done();

        const getAnswer = await user.conversation.getActivity(clickSecondLevelPrompt.json.id);

        validate.statusCode(getAnswer.response.status, 200);
        validate.jsonSchema(getAnswer.json, answerSchema.liveChatTransition);
        validate.answer(getAnswer.transitionData.selectedSubject, question.healthCoaching.text);
        validate.answer(getAnswer.transitionData.selectedSubTopic, liveChat.tobaccoCessation.text);
        validate.buttons(getAnswer.transitionData.questionsBeforeTransition, [`${userName}: ${question.healthCoaching.text}`, null]);
        validate.done();     
    });

    suiteTeardown(async function () {
        await user.conversation.teardown(this);
    });
});
