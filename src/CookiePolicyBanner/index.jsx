/* eslint-disable react/no-danger */
import React, { Component } from 'react';
import { StatusAlert } from '@edx/paragon';
import PropTypes from 'prop-types';

import {
  APP_CONFIG_INITIALIZED, mergeConfig, subscribe,
} from '@edx/frontend-platform';
import {
  ENGLISH_IETF_TAG,
  SPANISH_IETF_TAG,
  IETF_TAGS_TO_CLOSE_BUTTON_LABEL,
  IETF_TAGS_TO_CONTAINER_ROLE_LABEL,
  IETF_TAGS_TO_LANGUAGE_CODE,
} from '../constants';
import {
  getIETFTag,
  getPolicyHTML,
  getIETFTagFromLanguageCode,
  hasViewedCookieBanner,
  createHasViewedCookieBanner,
} from '../utilities';

subscribe(APP_CONFIG_INITIALIZED, () => {
  mergeConfig({
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME || 'openedx-language-preference',
    COOKIE_POLICY_COOKIE_DOMAIN: process.env.COOKIE_POLICY_COOKIE_DOMAIN,
    COOKIE_POLICY_VIEWED_COOKIE_NAME: process.env.COOKIE_POLICY_VIEWED_COOKIE_NAME || 'cookieconsent_status',
  }, 'Cookie Policy Banner additional config');
});

class CookieBanner extends Component {
  constructor(props) {
    super(props);

    this.onClose = this.onClose.bind(this);

    this.state = { open: false };
  }

  componentDidMount() {
    this.toggleDisplay(!hasViewedCookieBanner(this.props.isViewedCookieName));
  }

  componentDidUpdate() {
    if (this.state.open === true) {
      if (document.querySelectorAll('.edx-cookie-banner .btn') && document.querySelectorAll('.edx-cookie-banner .btn').length > 0) {
        document.querySelectorAll('.edx-cookie-banner .btn')[0].blur();
      }
    }
  }

  onClose(event) {
    this.setState({ open: false }, () => {
      createHasViewedCookieBanner(this.props.isViewedCookieName);
      this.props.onClose(event);
    });
  }

  toggleDisplay(open) {
    this.setState({ open });
  }

  render() {
    const { languageCode, policyText } = this.props;
    const { open } = this.state;
    const ietfTag = languageCode
      ? getIETFTagFromLanguageCode(languageCode) : getIETFTag();

    if (open) {
      return (
        <div
          lang={IETF_TAGS_TO_LANGUAGE_CODE[ietfTag]}
          className="edx-cookie-banner-wrapper"
          role="complementary"
          aria-label={IETF_TAGS_TO_CONTAINER_ROLE_LABEL[ietfTag]}
          aria-live="polite"
        >
          <StatusAlert
            className="edx-cookie-banner"
            open={this.state.open}
            closeButtonAriaLabel={IETF_TAGS_TO_CLOSE_BUTTON_LABEL[ietfTag]}
            dialog={(<span dangerouslySetInnerHTML={{ __html: getPolicyHTML(ietfTag, policyText) }} />)}
            onClose={this.onClose}
          />
        </div>
      );
    }

    return false;
  }
}

CookieBanner.defaultProps = {
  onClose: () => {},
  languageCode: undefined,
  policyText: {},
  isViewedCookieName: null,
};

CookieBanner.propTypes = {
  onClose: PropTypes.func,
  languageCode: PropTypes.string,
  policyText: PropTypes.shape({
    [ENGLISH_IETF_TAG]: PropTypes.string,
    [SPANISH_IETF_TAG]: PropTypes.string,
  }),
  isViewedCookieName: PropTypes.string,
};

export default CookieBanner;
