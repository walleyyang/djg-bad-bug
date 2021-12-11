export const port = process.env.BB_PORT || '';
export const mode = process.env.BB_MODE || '';
export const url = process.env.BB_URL || '';
export const username = process.env.BB_USERNAME || '';
export const password = process.env.BB_PASSWORD || '';
export const alertError = process.env.BB_ALERT_ERROR || '';
export const flowError = process.env.BB_FLOW_ERROR || '';
export const sendMessageError = process.env.BB_SEND_MESSAGE_ERROR || '';

// HTML Elements
export const htmlEmail = process.env.BB_HTML_EMAIL || '';
export const htmlPassword = process.env.BB_HTML_PASSWORD || '';
export const htmlLoginBtn = process.env.BB_HTML_LOGIN_BTN || '';
export const htmlOptionsMenu = process.env.BB_HTML_OPTIONS_MENU || '';
export const htmlOptionsFlowBody = process.env.BB_HTML_OPTIONS_FLOW_BODY || '';
export const htmlOptionsAlert = process.env.BB_HTML_OPTIONS_ALERT || '';
export const htmlOptionsAlertBtn = process.env.BB_HTML_OPTIONS_ALERT_BTN || '';
export const htmlOptionsFilter = process.env.BB_HTML_OPTIONS_FILTER || '';
export const htmlOptionsFilterAA = process.env.BB_HTML_OPTIONS_FILTER_AA || '';
export const htmlOptionsFilterAAA = process.env.BB_HTML_OPTIONS_FILTER_AAA || '';
export const htmlOptionsFilterSubmitBtn = process.env.BB_HTML_OPTIONS_FILTER_SUBMIT_BTN || '';
export const timeout = 3000;

// Launch config
export const headless = process.env.BB_HEADLESS === 'false' ? false : true;
export const launchArgs = ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox'];

// External
export const flowUrl = process.env.DH_FLOW_URL || '';
export const alertUrl = process.env.DH_ALERT_URL || '';
