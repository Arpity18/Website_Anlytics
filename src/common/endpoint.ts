const Endpoint = {
  LOGIN: "api/v1/auth/login/post/",
  SIGN_UP: "/dev/api/v1/auth/sign_up/post/",
  SIGN_OUT: "api/v1/auth/signout/post/", 
  CHANGE_PASSWORD: "api/v1/auth/change_password/post/",
  FORGOT_PASSWORD: "/dev/api/v1/auth/forgot_password/post/",
  CONFIRM_FORGOT_PASSWORD: "/dev/api/v1/auth/confirm_forgot_password/post/",
  VERIFY_OTP: "/dev/api/v1/auth/verify_otp/post/",
  RESEND_OTP: "/dev/api/v1/auth/resend_otp/post/",
  VERIFY_MFA: "api/v1/auth/mfa_verify/post/",
  IS_MFA: "api/v1/auth/is_mfa/post/",
  GET_SOFTWARE_TOKEN: "api/v1/auth/associate_software_token/post/",
  VERIFY_SOFTWARE_TOKEN: "api/v1/auth/verify_access_token/post/",
  SET_MFA_PREFERENCE: "api/v1/auth/verify_software_token/post/",
  SET_MFA_PREFERENCE_UPDATE: "api/v1/auth/set_mfa_preference/post/",
  PRODUCT: "access_control/products",

  WEBSITE_ANALYTICS: {
    SUMMARY: {
      GET_SUMMARY_STATS: "/api/v1/web/analytics/main-dashboard",
      GET_VISITORS_STATS: "/api/v1/web/analytics/daywise-traffic-overview",
      GET_PAGE_VIEWS_STATS: "/api/v1/web/analytics/page-views-over-time",
      GET_TOP_PAGES: "/api/v1/web/analytics/top-pages",
      GET_TRAFFIC_SOURCES: "/api/v1/web/analytics/traffic-sources",
      GET_DEVICE_BREAKDOWN: "/api/v1/web/analytics/device-breakdown",
      GET_DEAD_LINKS: "/api/v1/web/analytics/dead-links",
    },
    USER_ANALYSIS: {
      GET_USER_INTENT: "/api/v1/web/analytics/user-intent",
      GET_ENGAGEMENT_SESSIONS: "/api/v1/web/analytics/engagement-sessions",
    },
  },
};

export default Endpoint;
