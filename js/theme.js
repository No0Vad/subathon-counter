/** @type {HTMLElement} */ const elementThemeToggle = document.querySelector('[data-node="themeToggle"]');

const LIGHT_NAME = 'theme-light';
const DARK_NAME = 'theme-dark';

const STORAGE_NAME = 'SubCounter_Theme';

/**
 * Registers the theme logic
 */
const registerTheme = function ()
{
    let theme = getSavedTheme();
    if (theme == null)
    {
        theme = tryGetPreferredTheme();
        setSavedTheme(theme);
    }

    const htmlElement = document.documentElement;
    htmlElement.classList.add(theme);

    elementThemeToggle.addEventListener('click', e => 
    {
        if (htmlElement.classList.contains(LIGHT_NAME))
        {
            htmlElement.classList.remove(LIGHT_NAME);
            htmlElement.classList.add(DARK_NAME);
            setSavedTheme(DARK_NAME);
        }
        else if (htmlElement.classList.contains(DARK_NAME))
        {
            htmlElement.classList.remove(DARK_NAME);
            htmlElement.classList.add(LIGHT_NAME);
            setSavedTheme(LIGHT_NAME);
        }
    });
}


/**
 * Gets the saved theme
 */
const getSavedTheme = function ()
{
    return localStorage.getItem(STORAGE_NAME);
}


/**
 * Saves the selected theme
 * @param {string} theme 
 */
const setSavedTheme = function (theme)
{
    if (theme == null)
    {
        localStorage.removeItem(STORAGE_NAME);
        return;
    }
    localStorage.setItem(STORAGE_NAME, theme);
}


/**
 * Try and detect if they prefer the dark theme
 */
const tryGetPreferredTheme = function ()
{
    if (window.matchMedia)
    {
        let mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.matches)
        {
            return DARK_NAME;
        }
    }

    return LIGHT_NAME;
}


export 
{
    registerTheme
}