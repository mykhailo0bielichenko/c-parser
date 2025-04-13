export interface SelectorConfig {
  casinoName: string
  casinoLogo: string
  rating: string
  owner: string
  operator: string
  established: string
  revenue: string
  description: string
  paymentMethods: {
    container: string
    item: string
    name: string
    logo: string
  }
  licenses: {
    container: string
    item: string
    name: string
    countryCode: string
  }
  bonuses: {
    noDeposit: {
      container: string
      name: string
      name2: string
      popoverIdAttr: string
      detailsSelector: string
    }
    deposit: {
      container: string
      name: string
      name2: string
      popoverIdAttr: string
      detailsSelector: string
    }
  }
  gameTypes: {
    container: string
    item: string
    availableClass: string
  }
  gameProviders: {
    container: string
    item: string
    name: string
    logo: string
  }
  languages: {
    website: {
      container: string
      item: string
      name: string
    }
    support: {
      container: string
      item: string
      name: string
    }
    livechat: {
      container: string
      item: string
      name: string
    }
  }
  screenshots: {
    container: string
    item: string
    url: string
    alt: string
    mobileIndicator: string
  }
  features: {
    positives: {
      container: string
      item: string
      text: string
    }
    negatives: {
      container: string
      item: string
      text: string
    }
    interesting: {
      container: string
      item: string
      text: string
    }
  }
  restrictedCountries: {
    container: string
    item: string
    name: string
  }
  withdrawalTimes: {
    container: string
    method: string
    time: string
  }
  mobileApps: {
    container: string
    android: string
    ios: string
  }
  responsibleGambling: {
    container: string
    features: string
  }
  userReviews: {
    container: string
    item: string
    rating: string
    text: string
    author: string
    date: string
  }
}

// Default configuration for casino.guru
export const defaultConfig: SelectorConfig = {
  casinoName: ".casino-logo",
  casinoLogo: ".casino-logo",
  rating: ".rating b",
  owner: '.info-col-section-revenues:contains("Owner") b',
  operator: '.info-col-section-revenues:contains("Operator") b',
  established: '.info-col-section-revenues:contains("Established") b',
  revenue: '.info-col-section-revenues:contains("Estimated annual revenues") b',
  description: ".casino-detail-box-description",
  paymentMethods: {
    container: "#popover-payment-methods",
    item: ".casino-detail-logos-item",
    name: "a",
    logo: "img",
  },
  licenses: {
    container: ".license-list",
    item: "li",
    name: "a",
    countryCode: ".flag-icon",
  },
  bonuses: {
    noDeposit: {
      container: '.casino-detail-bonus-card:contains("No Deposit Bonus:")',
      name: ".bonus-name-1",
      name2: ".bonus-name-2",
      popoverIdAttr: "data-popover-content",
      detailsSelector: ".bonus-conditions-line",
    },
    deposit: {
      container: '.casino-detail-bonus-card:contains("Deposit Bonus:")',
      name: ".bonus-name-1",
      name2: ".bonus-name-2",
      popoverIdAttr: "data-popover-content",
      detailsSelector: ".bonus-conditions-line",
    },
  },
  gameTypes: {
    container: ".casino-card-available-games-ul",
    item: "li",
    availableClass: "active",
  },
  gameProviders: {
    container: "#popover-game-providers",
    item: ".casino-detail-logos-item",
    name: "a",
    logo: "img",
  },
  languages: {
    website: {
      container: "#popover-languages-website",
      item: ".flex",
      name: "span:last-child",
    },
    support: {
      container: "#popover-languages-support",
      item: ".flex",
      name: "span:last-child",
    },
    livechat: {
      container: "#popover-languages-livechat",
      item: ".flex",
      name: "span:last-child",
    },
  },
  screenshots: {
    container: ".screenshot-container",
    item: ".screenshot-item",
    url: "img",
    alt: "img",
    mobileIndicator: "mobile",
  },
  features: {
    positives: {
      container: '.casino-detail-box-pros .col:contains("Positives")',
      item: "li",
      text: "div",
    },
    negatives: {
      container: '.casino-detail-box-pros .col:contains("Negatives")',
      item: "li",
      text: "div",
    },
    interesting: {
      container: '.casino-detail-box-pros .col:contains("Interesting facts")',
      item: "li",
      text: "div",
    },
  },
  // New selectors for additional data
  restrictedCountries: {
    container: ".restricted-countries-list",
    item: "li",
    name: "span",
  },
  withdrawalTimes: {
    container: ".withdrawal-times-table",
    method: "td:first-child",
    time: "td:last-child",
  },
  mobileApps: {
    container: ".mobile-apps-section",
    android: ".android-app-link",
    ios: ".ios-app-link",
  },
  responsibleGambling: {
    container: ".responsible-gambling-section",
    features: "li",
  },
  userReviews: {
    container: ".user-reviews-section",
    item: ".review-item",
    rating: ".review-rating",
    text: ".review-text",
    author: ".review-author",
    date: ".review-date",
  },
}

// Configuration for askgamblers.com
export const askGamblersConfig: SelectorConfig = {
  casinoName: ".casino-title h1",
  casinoLogo: ".casino-logo img",
  rating: ".casino-rating .rating-value",
  owner: '.casino-info-item:contains("Owner") .info-value',
  operator: '.casino-info-item:contains("Operator") .info-value',
  established: '.casino-info-item:contains("Established") .info-value',
  revenue: '.casino-info-item:contains("Revenue") .info-value',
  description: ".casino-description",
  paymentMethods: {
    container: ".payment-methods-section",
    item: ".payment-method-item",
    name: ".method-name",
    logo: "img",
  },
  licenses: {
    container: ".licenses-section",
    item: ".license-item",
    name: ".license-name",
    countryCode: ".license-country",
  },
  bonuses: {
    noDeposit: {
      container: '.bonus-item:contains("No Deposit")',
      name: ".bonus-title",
      name2: ".bonus-subtitle",
      popoverIdAttr: "data-bonus-details",
      detailsSelector: ".bonus-detail-item",
    },
    deposit: {
      container: '.bonus-item:contains("Welcome Bonus")',
      name: ".bonus-title",
      name2: ".bonus-subtitle",
      popoverIdAttr: "data-bonus-details",
      detailsSelector: ".bonus-detail-item",
    },
  },
  gameTypes: {
    container: ".game-types-list",
    item: ".game-type-item",
    availableClass: "available",
  },
  gameProviders: {
    container: ".game-providers-section",
    item: ".provider-item",
    name: ".provider-name",
    logo: "img",
  },
  languages: {
    website: {
      container: ".website-languages",
      item: ".language-item",
      name: ".language-name",
    },
    support: {
      container: ".support-languages",
      item: ".language-item",
      name: ".language-name",
    },
    livechat: {
      container: ".livechat-languages",
      item: ".language-item",
      name: ".language-name",
    },
  },
  screenshots: {
    container: ".screenshots-gallery",
    item: ".screenshot-item",
    url: "img",
    alt: "img",
    mobileIndicator: "mobile",
  },
  features: {
    positives: {
      container: ".pros-section",
      item: ".pro-item",
      text: ".pro-text",
    },
    negatives: {
      container: ".cons-section",
      item: ".con-item",
      text: ".con-text",
    },
    interesting: {
      container: ".facts-section",
      item: ".fact-item",
      text: ".fact-text",
    },
  },
  restrictedCountries: {
    container: ".restricted-countries",
    item: ".country-item",
    name: ".country-name",
  },
  withdrawalTimes: {
    container: ".withdrawal-times",
    method: ".method-name",
    time: ".processing-time",
  },
  mobileApps: {
    container: ".mobile-apps",
    android: ".android-app",
    ios: ".ios-app",
  },
  responsibleGambling: {
    container: ".responsible-gambling",
    features: ".feature-item",
  },
  userReviews: {
    container: ".user-reviews",
    item: ".review",
    rating: ".review-rating",
    text: ".review-content",
    author: ".review-author",
    date: ".review-date",
  },
}

// Get the appropriate configuration based on the URL
export function getParserConfig(url: string): SelectorConfig {
  if (url.includes("askgamblers.com")) {
    return askGamblersConfig
  }

  // Add more site configurations as needed

  // Default to casino.guru configuration
  return defaultConfig
}
