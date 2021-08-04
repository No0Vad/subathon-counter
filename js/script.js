import { handleConfirmButton, animateError, getArrayNextIndexSafe, tryAndParseTimeCode, formatSecondsToTimecode, getTotalSecondsWithUnit } from './util.js';
import { saveToStorage, loadFromStorage } from './storage.js';
import { registerTheme } from './theme.js';

let queueProcessorInterval;
let everySecondInterval;

let subathonTimeLeftInSeconds = 0;
let subathonDurationInSeconds = 0;
let atCurrentRuleIndex = 0;
let isProcessingQueue = false;


/** @type {HTMLAnchorElement} */ const elementExportFile = document.getElementById('exportFile');
/** @type {HTMLInputElement} */ const elementImportFile = document.getElementById('importFile');

/** @type {HTMLElement} */ const elementTimeFormatted = document.querySelector('[data-node="timeFormatted"]');
/** @type {HTMLElement} */ const elementDurationFormatted = document.querySelector('[data-node="durationFormatted"]');
/** @type {HTMLInputElement} */ const inputTimerBackgroundColor = document.querySelector('[data-node="timerBackgroundColor"]');
/** @type {HTMLInputElement} */ const inputTimerTextColor = document.querySelector('[data-node="timerTextColor"]');
/** @type {HTMLButtonElement} */ const buttonTimerStart = document.querySelector('[data-node="timerStart"]');
/** @type {HTMLButtonElement} */ const buttonTimerPause = document.querySelector('[data-node="timerPause"]');
/** @type {HTMLButtonElement} */ const buttonTimerResume = document.querySelector('[data-node="timerResume"]');
/** @type {HTMLButtonElement} */ const buttonTimerStop = document.querySelector('[data-node="timerStop"]');
/** @type {HTMLInputElement} */ const inputChannelName = document.querySelector('[data-node="channelName"]');
/** @type {HTMLInputElement} */ const inputInitTimerValue = document.querySelector('[data-node="initTimerValue"]');
/** @type {HTMLInputElement} */ const inputStopTimerOnZero = document.querySelector('[data-node="stopTimerOnZero"]');

/** @type {HTMLButtonElement} */ const buttonNewRule = document.querySelector('[data-node="newRule"]');
/** @type {HTMLButtonElement} */ const buttonSaveRules = document.querySelector('[data-node="saveRules"]');
/** @type {HTMLButtonElement} */ const buttonExportRules = document.querySelector('[data-node="exportRules"]');
/** @type {HTMLButtonElement} */ const buttonImportRules = document.querySelector('[data-node="importRules"]');
/** @type {HTMLElement} */ const elementRuleTemplate = document.querySelector('[data-node="ruleTemplate"]');
/** @type {HTMLElement} */ const elementRules = document.querySelector('[data-node="timeRules"]');
/** @type {HTMLElement[]} */ let elementRuleEntities;

/** @type {HTMLInputElement} */ const inputManipulateValue = document.querySelector('[data-node="timeManipulationValue"]');
/** @type {HTMLButtonElement} */ const buttonAddTime = document.querySelector('[data-node="addTime"]');
/** @type {HTMLButtonElement} */ const buttonRemoveTime = document.querySelector('[data-node="removeTime"]');
/** @type {HTMLButtonElement} */ const buttonSetTime = document.querySelector('[data-node="setTime"]');


/**
 * @typedef StateStorageEntity
 * @property {string} timerBackgroundColor - The background color of the timer
 * @property {string} timerTextColor - The text color of the timer
 * 
 * @property {string} timerState - The timer state
 * @property {number} subathonTimeLeftInSeconds - Seconds left of the Subathon timer
 * @property {number} subathonDurationInSeconds - Duration of the Subathon timer in seconds
 * @property {number} atCurrentRuleIndex - Current index of active time rule
 * 
 * @property {string} channelName - Channel name to monitor
 * @property {string} initTimerValue - Value to start the timer on
 * @property {boolean} stopTimerOnZero - Stop once timer reaches zero
 * @property {TimeRuleEntity[]} timeRules - The array of rules
 */

/**
 * @typedef ExportPayloadEntity
 * @property {string} timerBackgroundColor - The background color of the timer
 * @property {string} timerTextColor - The text color of the timer
 * @property {string} channelName - Channel name to monitor
 * @property {string} initTimerValue - Value to start the timer on
 * @property {boolean} stopTimerOnZero - Stop once timer reaches zero
 * @property {TimeRuleEntity[]} timeRules - The array of rules
 */

/**
 * @typedef TimeRuleEntity
 * @property {number} index
 * @property {number} threshold
 * @property {number} value
 * @property {'h'|'m'|'s'} unit
 */
/** @type TimeRuleEntity[] */ let timeRules = [];
/** @type number[] */ let processQueue = [];

let client = null;

/**
 * Current timer state
 * @type {'started'|'paused'|'stopped'}
 */
let timerState = 'stopped';


/**
 * Checks what the current timer state is and updates the disabled states where needed
 */
const setTimerButtonStates = function ()
{
    if (timerState === 'started')
    {
        buttonTimerStart.disabled = true;
        buttonTimerPause.disabled = false;
        buttonTimerResume.disabled = true;
        buttonTimerStop.disabled = false;
        inputChannelName.disabled = true;
        inputInitTimerValue.disabled = true;
        inputStopTimerOnZero.disabled = true;

        inputManipulateValue.disabled = false;
        buttonAddTime.disabled = false;
        buttonRemoveTime.disabled = false;
        buttonSetTime.disabled = false;

        setRulesDisableState(true);
        startChatClient(); // Chat bot
        if (everySecondInterval != null)
        {
            clearInterval(everySecondInterval);
        }
        everySecondInterval = setInterval(everySecondLogic, 1000);

        if (queueProcessorInterval != null)
        {
            clearInterval(queueProcessorInterval);
        }
        queueProcessorInterval = setInterval(queueProcessorLogic, 200);

        elementRuleEntities = Array.from(elementRules.querySelectorAll('[data-node="rule"]'));

        setTimerContent(subathonTimeLeftInSeconds);
        setDurationContent(subathonDurationInSeconds);
        setVisualActiveRule(atCurrentRuleIndex);
    }
    else if (timerState === 'paused')
    {
        buttonTimerStart.disabled = true;
        buttonTimerPause.disabled = true;
        buttonTimerResume.disabled = false;
        buttonTimerStop.disabled = false;
        inputChannelName.disabled = true;
        inputInitTimerValue.disabled = true;
        inputStopTimerOnZero.disabled = true;

        inputManipulateValue.disabled = false;
        buttonAddTime.disabled = false;
        buttonRemoveTime.disabled = false;
        buttonSetTime.disabled = false;

        setRulesDisableState(true);
    }
    else if (timerState === 'stopped')
    {
        buttonTimerStart.disabled = false;
        buttonTimerPause.disabled = true;
        buttonTimerResume.disabled = true;
        buttonTimerStop.disabled = true;
        inputChannelName.disabled = false;
        inputInitTimerValue.disabled = false;
        inputStopTimerOnZero.disabled = false;

        inputManipulateValue.disabled = true;
        buttonAddTime.disabled = true;
        buttonRemoveTime.disabled = true;
        buttonSetTime.disabled = true;

        setRulesDisableState(false);
        stopChatClient(); // Chat bot
        clearInterval(everySecondInterval);
        clearInterval(queueProcessorInterval);
        setTimerContent(0);
        setDurationContent(0);
        setVisualActiveRule(null);
    }

    saveToStorage({ timerState: timerState });
}


/**
 * Starts the Twitch Chat Client
 */
const startChatClient = function ()
{
    if (client != null && client.channels[0] === '#' + inputChannelName.value)
    {
        console.log('Chat Client already exists, resuming');
        return;
    }

    client = new tmi.Client({
        channels: [inputChannelName.value]
    });

    client.on('subscription', (channel, username, months, message, userstate, methods) =>
    {
        if (timerState !== 'started')
        {
            return;
        }

        console.log(`New sub - ${username}`);
        processQueue.push(1);
    });

    client.on('resub', (channel, username, months, message, userstate, methods) =>
    {
        if (timerState !== 'started')
        {
            return;
        }

        console.log(`Resub - ${username}`);
        processQueue.push(1);
    });

    client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) =>
    {
        if (timerState !== 'started')
        {
            return;
        }

        console.log(`User ${recipient} was given a gift sub from ${username}`);
        processQueue.push(1);
    });

    client.on('submysterygift', (channel, username, numbOfSubs, methods, userstate) =>
    {
        if (timerState !== 'started')
        {
            return;
        }

        console.log(`${numbOfSubs} subs was given to the chat from ${username}!`);
        processQueue.push(numbOfSubs - 0);
    });

    client.on('giftpaidupgrade', (channel, username, sender, userstate) =>
    {
        if (timerState !== 'started')
        {
            return;
        }
    });

    client.on('connecting', (address, port) =>
    {
        console.log(`Connecting to ${address}:${port}...`);
    });

    client.on('connected', (address, port) =>
    {
        console.log(`Connection ${address}:${port} established!`);
    });

    client.on('disconnected', (reason) =>
    {
        console.log(`Connection lost! ${reason}`);
    });

    client.on('reconnect', () =>
    {
        console.log('Reconnecting...');
    });

    client.connect();

    console.log(`Chat Client started, listening on ${inputChannelName.value}`);
}


/**
 * Stops the Twitch Chat Client
 */
const stopChatClient = function ()
{
    if (client)
    {
        client.disconnect();
    }

    client = null;

    console.log('Chat Client stopped');
}


/**
 * Sets the disabled state of the timer controls
 * @param {boolean} state 
 */
const setRulesDisableState = function (state)
{
    buttonNewRule.disabled = state;
    buttonSaveRules.disabled = state;
    buttonExportRules.disabled = state;
    buttonImportRules.disabled = state;
    elementExportFile.disabled = state;
    elementImportFile.disabled = state;

    document.querySelectorAll('[data-node="removeTimeRule"]').forEach(item => item.disabled = state);
    document.querySelectorAll('[data-node="timeCode"]').forEach(item => item.disabled = state);
    document.querySelectorAll('[data-node="timeValue"]').forEach(item => item.disabled = state);
    document.querySelectorAll('[data-node="timeUnit"]').forEach(item => item.disabled = state);
}


/**
 * Sets the visual active rule
 * @param {number} index 
 */
const setVisualActiveRule = function (index)
{
    if (elementRuleEntities == null)
    {
        return;
    }

    for (let i = 0; i < elementRuleEntities.length; i++)
    {
        elementRuleEntities[i].classList.remove('active');
    }

    if (index != null)
    {
        elementRuleEntities[index].classList.add('active');
    }
}


/**
 * Checks the local storage if data has been stored there
 */
const loadStorageDataIfAny = function ()
{
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);

    const loaded = loadFromStorage({
        timerBackgroundColor: rootStyle.getPropertyValue('--timer-background-color').trim(),
        timerTextColor: rootStyle.getPropertyValue('--timer-text-color').trim(),

        timerState: timerState,
        channelName: '',
        initTimerValue: null,
        stopTimerOnZero: null,
        timeRules: null,

        subathonTimeLeftInSeconds: null,
        subathonDurationInSeconds: null,
        atCurrentRuleIndex: null
    });

    // Do we have the timer background color saved?
    inputTimerBackgroundColor.value = loaded.timerBackgroundColor;
    root.style.setProperty('--timer-background-color', loaded.timerBackgroundColor);

    // Do we have the timer text color saved?
    inputTimerTextColor.value = loaded.timerTextColor;
    root.style.setProperty('--timer-text-color', loaded.timerTextColor);

    // Do we have a timer state saved?
    timerState = loaded.timerState;

    // Do we have the channel saved?
    inputChannelName.value = loaded.channelName;

    // Do we have the initial time saved?
    const rawInitTime = loaded.initTimerValue;
    if (rawInitTime != null)
    {
        inputInitTimerValue.value = formatSecondsToTimecode(rawInitTime - 0);
        inputInitTimerValue.dataset.seconds = rawInitTime;
    }

    // Do we have the choice on stop on zero saved?
    const rawStopOnZero = loaded.stopTimerOnZero;
    if (rawStopOnZero != null)
    {
        inputStopTimerOnZero.checked = rawStopOnZero;
    }

    // Do we have some rules saved?
    const rawTimeRules = loaded.timeRules;
    if (rawTimeRules != null)
    {
        timeRules = rawTimeRules;
        renderRules();
    }


    // Do we have the subation time saved?
    const rawSubationTime = loaded.subathonTimeLeftInSeconds;
    if (rawSubationTime != null)
    {
        subathonTimeLeftInSeconds = rawSubationTime;
        setTimerContent(rawSubationTime);
    }

    // Do we have the subation duration saved?
    const rawSubationDuration = loaded.subathonDurationInSeconds;
    if (rawSubationDuration != null)
    {
        subathonDurationInSeconds = rawSubationDuration;
        setDurationContent(rawSubationDuration);
    }

    // Do we have the current rule index saved?
    const rawRuleIndex = loaded.atCurrentRuleIndex;
    if (rawRuleIndex != null)
    {
        atCurrentRuleIndex = rawRuleIndex;
    }
}


/**
 * Binds event listeneres to controls
 */
const setElementEventListeners = function ()
{
    inputTimerBackgroundColor.addEventListener('change', e =>
    {
        document.documentElement.style.setProperty('--timer-background-color', e.target.value);
        saveToStorage({ timerBackgroundColor: e.target.value });
    });

    inputTimerTextColor.addEventListener('change', e =>
    {
        document.documentElement.style.setProperty('--timer-text-color', e.target.value);
        saveToStorage({ timerTextColor: e.target.value });
    });

    buttonTimerStart.addEventListener('click', e =>
    {
        if (inputChannelName.value.length === 0)
        {
            alert('You must enter the channel name for the bot to monitor!');
            return;
        }

        if (timeRules.length === 0)
        {
            alert('You must add atleast one time rule!');
            return;
        }

        if (!handleConfirmButton('ButtonTimerStart', e.currentTarget))
        {
            return;
        }

        subathonDurationInSeconds = 0;
        subathonTimeLeftInSeconds = 0;
        atCurrentRuleIndex = 0;

        const secondsAddon = (inputInitTimerValue.dataset.seconds || 0) - 0;
        if (!isNaN(secondsAddon) && secondsAddon > 0)
        {
            subathonTimeLeftInSeconds = secondsAddon;
        }

        timerState = "started";
        saveToStorage({ timerState: timerState });
        setTimerButtonStates();
    });

    buttonTimerPause.addEventListener('click', e =>
    {
        if (!handleConfirmButton('ButtonTimerPause', e.currentTarget))
        {
            return;
        }

        timerState = "paused";
        setTimerButtonStates();
    });

    buttonTimerResume.addEventListener('click', e =>
    {
        if (!handleConfirmButton('ButtonTimerResume', e.currentTarget))
        {
            return;
        }

        timerState = "started";
        setTimerButtonStates();
    });

    buttonTimerStop.addEventListener('click', e =>
    {
        if (!handleConfirmButton('ButtonTimerStop', e.currentTarget))
        {
            return;
        }

        timerStopButtonLogic();
    });

    inputChannelName.addEventListener('change', e => saveToStorage({ channelName: e.target.value }));
    inputStopTimerOnZero.addEventListener('change', e => saveToStorage({ stopTimerOnZero: e.target.checked }));

    inputInitTimerValue.addEventListener('change', e =>
    {
        const newValue = tryAndParseTimeCode(e.target.value);

        if (isNaN(newValue))
        {
            e.target.value = formatSecondsToTimecode(0);
            animateError(e.target);
            return;
        }

        saveToStorage({ initTimerValue: newValue });
        e.target.value = formatSecondsToTimecode(newValue);
        e.target.dataset.seconds = newValue;
    });

    buttonNewRule.addEventListener('click', () =>
    {
        const index = timeRules.length;
        let tempThreshold = 0;

        if (index > 0)
        {
            tempThreshold = timeRules[index - 1].threshold + 30
        }

        timeRules.push({
            index: index,
            threshold: tempThreshold,
            value: 5,
            unit: 'm'
        });

        sortRules();
        renderRules();
        saveToStorage({ timeRules: timeRules });
    });

    buttonSaveRules.addEventListener('click', e =>
    {
        sortRules();
        renderRules();
        saveToStorage({ timeRules: timeRules });
    });

    buttonExportRules.addEventListener('click', e =>
    {
        /** @type {ExportPayloadEntity} */
        const payload = {
            timerBackgroundColor: inputTimerBackgroundColor.value,
            timerTextColor: inputTimerTextColor.value,

            channelName: inputChannelName.value,
            initTimerValue: inputInitTimerValue.dataset.seconds,
            stopTimerOnZero: inputStopTimerOnZero.checked,
            timeRules: timeRules
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
        elementExportFile.setAttribute("href", dataStr);
        elementExportFile.setAttribute("download", "Subathon-Rules.json");
        elementExportFile.click();
    });

    elementImportFile.addEventListener('change', e =>
    {
        const reader = new FileReader();
        reader.onload = e2 =>
        {
            try
            {
                /** @type {ExportPayloadEntity} */
                const payload = JSON.parse(e2.target.result);

                inputTimerBackgroundColor.value = payload.timerBackgroundColor;
                inputTimerTextColor.value = payload.timerTextColor;
                inputChannelName.value = payload.channelName;
                inputInitTimerValue.value = formatSecondsToTimecode(payload.initTimerValue);
                inputStopTimerOnZero.checked = payload.stopTimerOnZero;
                timeRules = payload.timeRules;
                renderRules();

                document.documentElement.style.setProperty('--timer-background-color', payload.timerBackgroundColor);
                document.documentElement.style.setProperty('--timer-text-color', payload.timerTextColor);

                saveToStorage({
                    timerBackgroundColor: payload.timerBackgroundColor,
                    timerTextColor: payload.timerTextColor,
                    channelName: payload.channelName,
                    initTimerValue: payload.initTimerValue,
                    stopTimerOnZero: payload.stopTimerOnZero,
                    timeRules: payload.timeRules
                });

                alert('Import was successful!');
            }
            catch (error)
            {
                alert('Import Failed! Content might be corrupted or invalid');
                console.error(error);
            }
        };
        reader.readAsText(e.target.files[0]);
    });



    /**
     * Core logic for timer manipulation
     * @param {string} name 
     * @param {HTMLButtonElement} button 
     * @param {function(number, number):number} tranform 
     * @returns 
     */
    const manipulationFunc = (name, button, tranform) =>
    {
        if (inputManipulateValue.value === '' || !handleConfirmButton(name, button))
        {
            return;
        }

        const manipulateValue = tryAndParseTimeCode(inputManipulateValue.value);
        if (!isNaN(manipulateValue))
        {
            subathonTimeLeftInSeconds = tranform(subathonTimeLeftInSeconds, manipulateValue);
            setTimerContent(subathonTimeLeftInSeconds);
            saveToStorage({ subathonTimeLeftInSeconds: subathonTimeLeftInSeconds });
        }
        else
        {
            animateError(inputManipulateValue);
        }

        inputManipulateValue.value = '';
    }

    buttonAddTime.addEventListener('click', e => manipulationFunc('ButtonAddTime', e.currentTarget, (total, change) => total + change));
    buttonRemoveTime.addEventListener('click', e => manipulationFunc('ButtonRemoveTime', e.currentTarget, (total, change) => total - change));
    buttonSetTime.addEventListener('click', e => manipulationFunc('ButtonRemoveTime', e.currentTarget, (_, change) => change));
}


/**
 * Logic to execute every second when the timer has started
 */
const everySecondLogic = function ()
{
    if (timerState !== 'started')
    {
        return;
    }

    setTimerContent(subathonTimeLeftInSeconds);
    setDurationContent(subathonDurationInSeconds);

    if (inputStopTimerOnZero.checked && subathonTimeLeftInSeconds <= 0)
    {
        timerStopButtonLogic();
    }

    if (!isProcessingQueue)
    {
        const nextRule = timeRules[getArrayNextIndexSafe(atCurrentRuleIndex, timeRules.length)];

        if (subathonTimeLeftInSeconds >= nextRule.threshold || subathonDurationInSeconds >= nextRule.threshold)
        {
            if (atCurrentRuleIndex !== (timeRules.length - 1))
            {
                atCurrentRuleIndex++;
                setVisualActiveRule(atCurrentRuleIndex);
                saveToStorage({ atCurrentRuleIndex: atCurrentRuleIndex });
            }
        }
    }

    subathonTimeLeftInSeconds--;
    if (subathonTimeLeftInSeconds < 0)
    {
        subathonTimeLeftInSeconds = 0;
    }

    subathonDurationInSeconds++;

    saveToStorage({
        subathonTimeLeftInSeconds: subathonTimeLeftInSeconds,
        subathonDurationInSeconds: subathonDurationInSeconds
    });
}


/**
 * Process the gift subs in the queue
 */
const queueProcessorLogic = function ()
{
    if (timerState !== 'started')
    {
        return;
    }

    const queueItem = processQueue.shift();

    if (queueItem == null)
    {
        return;
    }

    isProcessingQueue = true;

    const timeRulesLength = timeRules.length;
    const startTime = subathonTimeLeftInSeconds;

    for (let i = 0; i < queueItem; i++)
    {
        const rule = timeRules[atCurrentRuleIndex];
        const nextRule = timeRules[getArrayNextIndexSafe(atCurrentRuleIndex, timeRulesLength)];

        subathonTimeLeftInSeconds += getTotalSecondsWithUnit(rule.value, rule.unit);

        if (subathonTimeLeftInSeconds >= nextRule.threshold || subathonDurationInSeconds >= nextRule.threshold)
        {
            if (atCurrentRuleIndex !== (timeRulesLength - 1))
            {
                atCurrentRuleIndex++;
                setVisualActiveRule(atCurrentRuleIndex);
                saveToStorage({ atCurrentRuleIndex: atCurrentRuleIndex });
            }
        }
    }

    const endTime = subathonTimeLeftInSeconds;

    console.log(`${formatSecondsToTimecode(startTime)} => ${formatSecondsToTimecode(endTime)} -- A increase of ${formatSecondsToTimecode(endTime - startTime)}`);

    isProcessingQueue = false;
}


/**
 * Updates the timer text
 * @param {number} seconds 
 */
const setTimerContent = function (seconds)
{
    elementTimeFormatted.textContent = formatSecondsToTimecode(isNaN(seconds) ? 0 : seconds);
}


/**
 * Updates the duration text
 * @param {number} seconds 
 */
const setDurationContent = function (seconds)
{
    elementDurationFormatted.textContent = formatSecondsToTimecode(isNaN(seconds) ? 0 : seconds);
}


/**
 * The logic for the stop and reset button, so it can be used elsewhere too
 */
const timerStopButtonLogic = function ()
{
    timerState = "stopped";

    // Delete from storage
    saveToStorage({
        subathonTimeLeftInSeconds: null,
        subathonDurationInSeconds: null,
        atCurrentRuleIndex: null
    });

    setTimerButtonStates();
}


/**
 * Sorts the rules, lowest threshold first
 */
const sortRules = function ()
{
    timeRules.sort((a, b) => (a.threshold > b.threshold) ? 1 : ((b.threshold > a.threshold) ? -1 : 0));
}


/**
 * Renders the current rules
 */
const renderRules = function ()
{
    // Empty
    while (elementRules.firstChild)
    {
        elementRules.removeChild(elementRules.firstChild);
    }

    for (let i = 0; i < timeRules.length; i++)
    {
        /** @type {HTMLElement} */
        const clone = elementRuleTemplate.cloneNode(true);

        clone.dataset.index = i;
        clone.dataset.node = 'rule';
        clone.style.display = '';

        handleRuleRemove(i, clone);
        handleRuleTimeCode(i, clone);
        handleRuleValue(i, clone);
        handleRuleUnit(i, clone);

        elementRules.appendChild(clone);
    }
}


/**
 * Logic for a rendered rule, how to remove it
 * @param {number} index 
 * @param {HTMLElement} rule 
 */
const handleRuleRemove = function (index, rule)
{
    /** @type {HTMLElement} */
    const removeTimeRule = rule.querySelector('[data-node="removeTimeRule"]');

    removeTimeRule.addEventListener('click', e =>
    {
        if (!handleConfirmButton(`ButtonRuleDelete-${index}`, e.currentTarget))
        {
            return;
        }

        timeRules.splice(index, 1);
        saveToStorage({ timeRules: timeRules });
        renderRules();
    });
}


/**
 * Logic for a rendered rule, handling the timecode interaction
 * @param {number} index 
 * @param {HTMLElement} rule 
 */
const handleRuleTimeCode = function (index, rule)
{
    /** @type {HTMLInputElement} */
    const timeCode = rule.querySelector('[data-node="timeCode"]');
    timeCode.dataset.value = timeRules[index].threshold;

    /** @param {Event} e */
    const saveNewThreshold = function (e)
    {
        const newThreshold = tryAndParseTimeCode(e.target.value);
        if (isNaN(newThreshold))
        {
            e.target.value = formatSecondsToTimecode(timeCode.dataset.value);
            animateError(e.target);
            return;
        }

        timeRules[index].threshold = newThreshold;
        e.target.value = formatSecondsToTimecode(newThreshold);
        saveToStorage({ timeRules: timeRules });
    }

    timeCode.value = formatSecondsToTimecode(timeRules[index].threshold);
    timeCode.addEventListener('change', e => saveNewThreshold(e));
    timeCode.addEventListener('keyup', e => e.key === 'enter' && saveNewThreshold(e));
}


/**
 * Logic for a rendered rule, handling the timecode interaction
 * @param {number} index 
 * @param {HTMLElement} rule 
 */
const handleRuleValue = function (index, rule)
{
    /** @type {HTMLInputElement} */
    const timeValue = rule.querySelector('[data-node="timeValue"]');
    timeValue.dataset.value = timeRules[index].value;

    /** @param {Event} e */
    const saveNewValue = function (e)
    {
        const newValue = e.target.value - 0;
        if (isNaN(newValue) || newValue === 0)
        {
            e.target.value = timeValue.dataset.value;
            animateError(e.target);
            return;
        }

        timeRules[index].value = newValue;
        saveToStorage({ timeRules: timeRules });
    }

    timeValue.value = timeRules[index].value;
    timeValue.addEventListener('change', e => saveNewValue(e));
    timeValue.addEventListener('keyup', e => e.key === 'enter' && saveNewValue(e));
}


/**
 * Logic for a rendered rule, handling the unit interaction
 * @param {number} index 
 * @param {HTMLElement} rule 
 */
const handleRuleUnit = function (index, rule)
{
    /** @type {HTMLSelectElement} */
    const timeUnit = rule.querySelector('[data-node="timeUnit"]');

    /** @param {Event} e */
    const saveNewUnit = function (e)
    {
        timeRules[index].unit = e.target.value;
        saveToStorage({ timeRules: timeRules });
    }

    timeUnit.value = timeRules[index].unit;
    timeUnit.addEventListener('change', e => saveNewUnit(e));
}



registerTheme();
setElementEventListeners();
loadStorageDataIfAny();
setTimerButtonStates();