
const confirmTimeouts = {};



/**
 * Helper for the confirm buttons
 * @param {string} id 
 * @param {HTMLButtonElement} button 
 */
const handleConfirmButton = function (id, button)
{
    if (!button.classList.contains('confirm'))
    {
        button.classList.add('confirm');
        confirmTimeouts[id] = setTimeout(() =>
        {
            button.classList.remove('confirm');

            clearTimeout(confirmTimeouts[id]);
            delete confirmTimeouts[id];
        }, 2000);
        return false;
    }

    if (confirmTimeouts[id] != null)
    {
        button.classList.remove('confirm');
        clearTimeout(confirmTimeouts[id]);
        delete confirmTimeouts[id];
    }

    return true;
}


/**
 * Adds a error class and removes it after a while, to make it flash
 * @param {HTMLInputElement} input 
 */
const animateError = function (input)
{
    input.classList.add('error');

    setTimeout(() =>
    {
        input.classList.remove('error');
    }, 400);
}


/**
 * Helper for safly getting the next array index
 * @param {number} current 
 * @param {number} arrayLenght 
 */
const getArrayNextIndexSafe = function (current, arrayLenght)
{
    if (current + 1 <= arrayLenght - 1)
    {
        return current + 1;
    }

    return current;
}


/**
 * Tries to parse a timecode string to total seconds.
 * 1h 2m 3s also supported
 * @param {string} raw 
 */
const tryAndParseTimeCode = function (raw)
{
    let parts = raw.split(':');
    if (parts.length == 1 && parts[0] === '')
    {
        parts = [];
    }

    const isTextBased = raw.indexOf('h') !== -1 || raw.indexOf('m') !== -1 || raw.indexOf('s') !== -1;

    if (parts.length > 0 && !isTextBased)
    {
        if (parts.length === 1)
        {
            return parts[0] - 0;
        }

        if (parts.length === 2)
        {
            return ((parts[0] - 0) * 60) + (parts[1] - 0);
        }

        if (parts.length === 3)
        {
            return ((parts[0] - 0) * 60 * 60) + ((parts[1] - 0) * 60) + (parts[2] - 0);
        }
    }

    parts = raw.split(' ');
    if (parts.length == 1 && parts[0] === '')
    {
        parts = [];
    }

    if (parts.length > 0 && isTextBased)
    {
        let totalSeconds = 0;
        for (let i = 0; i < parts.length; i++)
        {
            const part = parts[i];
            if (part.length <= 1)
            {
                continue;
            }

            const value = part.substring(0, part.length - 1);
            const unit = part.slice(-1);

            if (unit === 'h')
            {
                totalSeconds += (value - 0) * 60 * 60;
            }
            else if (unit === 'm')
            {
                totalSeconds += (value - 0) * 60;
            }
            else if (unit === 's')
            {
                totalSeconds += value - 0;
            }
        }

        return totalSeconds;
    }

    return NaN;
}


/**
 * Formats seconds to timecode
 * @param {number} threshold 
 */
const formatSecondsToTimecode = function (threshold)
{
    const hours = Math.floor(threshold / 3600)
    const minutes = Math.floor(threshold / 60) % 60
    const seconds = threshold % 60

    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":")
}


/**
 * Converts the value with a unit to get to total seconds
 * @param {number} value
 * @param {'h'|'m'|'s'} unit
 */
const getTotalSecondsWithUnit = function (value, unit)
{
    if (unit === 'h')
    {
        return value * 24 * 60;
    }

    if (unit === 'm')
    {
        return value * 60;
    }

    return value;
}


/**
 * Helper for toggling a state class on a HTMLElement
 * @param {HTMLElement} element 
 * @param {boolean} state 
 * @param {string} trueValue 
 * @param {string} falseValue 
 * @param {string} nullValue 
 * @returns 
 */
const cssClassStateOnElement = function (element, state, trueValue, falseValue, nullValue)
{
    if (state === true)
    {
        element.classList.add(trueValue);
        element.classList.remove(falseValue);

        if (nullValue != null)
        {
            element.classList.remove(nullValue);
        }

        return;
    }

    if (state === false)
    {
        element.classList.remove(trueValue);
        element.classList.add(falseValue);

        if (nullValue != null)
        {
            element.classList.remove(nullValue);
        }

        return;
    }

    element.classList.remove(trueValue);
    element.classList.remove(falseValue);

    if (nullValue != null)
    {
        element.classList.add(nullValue);
    }
}


export
{
    handleConfirmButton,
    animateError,
    getArrayNextIndexSafe,
    tryAndParseTimeCode,
    formatSecondsToTimecode,
    getTotalSecondsWithUnit,
    cssClassStateOnElement
}