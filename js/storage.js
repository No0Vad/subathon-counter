const STORAGE_NAME_TIMER_BACKGROUND_COLOR = 'SubCounter_TimerBackgroundColor';
const STORAGE_NAME_TIMER_TEXT_COLOR = 'SubCounter_TimerTextColor';
const STORAGE_NAME_TIMER_STATE = 'SubCounter_TimerState';
const STORAGE_NAME_RULES = 'SubCounter_TimeRules';
const STORAGE_NAME_CHANNEL_NAME = 'SubCounter_ChannelName';
const STORAGE_NAME_INIT_TIME = 'SubCounter_InitTimerValue';
const STORAGE_NAME_STOP_ON_ZERO = 'SubCounter_StopTimerOnZero';
const STORAGE_NAME_USE_DURATION_TOO = 'SubCounter_UseDurationToo';
const STORAGE_NAME_SUBATHON_TIME = 'SubCounter_SubathonTime';
const STORAGE_NAME_SUBATHON_DURATION = 'SubCounter_SubathonDuration';
const STORAGE_NAME_SUBATHON_RULE_INDEX = 'SubCounter_SubathonRuleIndex';

/**
 * Saves data
 * @param {import('./script.js').StateStorageEntity} cfg 
 */
const saveToStorage = function (cfg)
{
    if (cfg.hasOwnProperty("timerBackgroundColor"))
    {
        if (cfg.timerBackgroundColor == null || cfg.timerBackgroundColor == '')
        {
            localStorage.removeItem(STORAGE_NAME_TIMER_BACKGROUND_COLOR);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_TIMER_BACKGROUND_COLOR, cfg.timerBackgroundColor);
        }
    }

    if (cfg.hasOwnProperty("timerTextColor"))
    {
        if (cfg.timerTextColor == null || cfg.timerTextColor == '')
        {
            localStorage.removeItem(STORAGE_NAME_TIMER_TEXT_COLOR);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_TIMER_TEXT_COLOR, cfg.timerTextColor);
        }
    }

    if (cfg.hasOwnProperty("timerState"))
    {
        if (cfg.timerState == null || cfg.timerState == '')
        {
            localStorage.removeItem(STORAGE_NAME_TIMER_STATE);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_TIMER_STATE, cfg.timerState);
        }
    }

    if (cfg.hasOwnProperty("subathonTimeLeftInSeconds"))
    {
        if (cfg.subathonTimeLeftInSeconds == null)
        {
            localStorage.removeItem(STORAGE_NAME_SUBATHON_TIME);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_SUBATHON_TIME, cfg.subathonTimeLeftInSeconds);
        }
    }

    if (cfg.hasOwnProperty("subathonDurationInSeconds"))
    {
        if (cfg.subathonDurationInSeconds == null)
        {
            localStorage.removeItem(STORAGE_NAME_SUBATHON_DURATION);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_SUBATHON_DURATION, cfg.subathonDurationInSeconds);
        }
    }

    if (cfg.hasOwnProperty("atCurrentRuleIndex"))
    {
        if (cfg.atCurrentRuleIndex == null)
        {
            localStorage.removeItem(STORAGE_NAME_SUBATHON_RULE_INDEX);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_SUBATHON_RULE_INDEX, cfg.atCurrentRuleIndex);
        }
    }

    if (cfg.hasOwnProperty("channelName"))
    {
        if (cfg.channelName == null || cfg.channelName == '')
        {
            localStorage.removeItem(STORAGE_NAME_CHANNEL_NAME);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_CHANNEL_NAME, cfg.channelName);
        }
    }

    if (cfg.hasOwnProperty("initTimerValue"))
    {
        if (cfg.initTimerValue == null || cfg.initTimerValue == '')
        {
            localStorage.removeItem(STORAGE_NAME_INIT_TIME);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_INIT_TIME, cfg.initTimerValue);
        }
    }

    if (cfg.hasOwnProperty("stopTimerOnZero"))
    {
        if (cfg.stopTimerOnZero == null)
        {
            localStorage.removeItem(STORAGE_NAME_STOP_ON_ZERO);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_STOP_ON_ZERO, cfg.stopTimerOnZero ? 1 : 0);
        }
    }

    if (cfg.hasOwnProperty("useDurationToo"))
    {
        if (cfg.useDurationToo == null)
        {
            localStorage.removeItem(STORAGE_NAME_USE_DURATION_TOO);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_USE_DURATION_TOO, cfg.useDurationToo ? 1 : 0);
        }
    }

    if (cfg.hasOwnProperty("timeRules"))
    {
        if (cfg.timeRules == null)
        {
            localStorage.removeItem(STORAGE_NAME_RULES);
        }
        else
        {
            localStorage.setItem(STORAGE_NAME_RULES, JSON.stringify(cfg.timeRules));
        }
    }
}


/**
 * Loads data
 * @param {import('./script.js').StateStorageEntity} cfg 
 */
const loadFromStorage = function (cfg)
{
    if (cfg.hasOwnProperty("timerBackgroundColor"))
    {
        const val = localStorage.getItem(STORAGE_NAME_TIMER_BACKGROUND_COLOR);
        if (val != null && val != '')
        {
            cfg.timerBackgroundColor = val;
        }
    }

    if (cfg.hasOwnProperty("timerTextColor"))
    {
        const val = localStorage.getItem(STORAGE_NAME_TIMER_TEXT_COLOR);
        if (val != null && val != '')
        {
            cfg.timerTextColor = val;
        }
    }

    if (cfg.hasOwnProperty("timerState"))
    {
        const val = localStorage.getItem(STORAGE_NAME_TIMER_STATE);
        if (val != null && val != '')
        {
            cfg.timerState = val;
        }
    }

    if (cfg.hasOwnProperty("subathonTimeLeftInSeconds"))
    {
        const val = localStorage.getItem(STORAGE_NAME_SUBATHON_TIME);
        const num = val - 0;
        if (val !== '' && !isNaN(num))
        {
            cfg.subathonTimeLeftInSeconds = num;
        }
    }

    if (cfg.hasOwnProperty("subathonDurationInSeconds"))
    {
        const val = localStorage.getItem(STORAGE_NAME_SUBATHON_DURATION) - 0;
        const num = val - 0;
        if (val != '' && !isNaN(num))
        {
            cfg.subathonDurationInSeconds = num;
        }
    }

    if (cfg.hasOwnProperty("atCurrentRuleIndex"))
    {
        const val = localStorage.getItem(STORAGE_NAME_SUBATHON_RULE_INDEX) - 0;
        const num = val - 0;
        if (val !== '' && !isNaN(num))
        {
            cfg.atCurrentRuleIndex = num;
        }
    }

    if (cfg.hasOwnProperty("channelName"))
    {
        const val = localStorage.getItem(STORAGE_NAME_CHANNEL_NAME);
        if (val != null && val != '')
        {
            cfg.channelName = val;
        }
    }

    if (cfg.hasOwnProperty("initTimerValue"))
    {
        const val = localStorage.getItem(STORAGE_NAME_INIT_TIME) - 0;
        const num = val - 0;
        if (val !== '' && !isNaN(num))
        {
            cfg.initTimerValue = num;
        }
    }

    if (cfg.hasOwnProperty("stopTimerOnZero"))
    {
        const val = localStorage.getItem(STORAGE_NAME_STOP_ON_ZERO) - 0;
        const num = val - 0;
        if (val !== '' && !isNaN(num))
        {
            cfg.stopTimerOnZero = num === 1;
        }
    }

    if (cfg.hasOwnProperty("useDurationToo"))
    {
        const val = localStorage.getItem(STORAGE_NAME_USE_DURATION_TOO) - 0;
        const num = val - 0;
        if (val !== '' && !isNaN(num))
        {
            cfg.useDurationToo = num === 1;
        }
    }

    if (cfg.hasOwnProperty("timeRules"))
    {
        const val = localStorage.getItem(STORAGE_NAME_RULES);
        if (val != null && val != '')
        {
            try
            {
                const json = JSON.parse(val);
                cfg.timeRules = json;
            }
            catch (error)
            {
                console.error('Could not parse timeRules from storage!', error);
            }
        }
    }

    return cfg;
}


export
{
    saveToStorage,
    loadFromStorage
}