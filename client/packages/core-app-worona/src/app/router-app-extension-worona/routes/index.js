/* eslint-disable react/prefer-stateless-function, react/no-multi-comp, react/prop-types
eslint-disable prefer-template, react/prefer-es6-class, react/jsx-filename-extension, camelcase,
react/no-unused-prop-types, no-undef */
import React from 'react';
import { dep } from 'worona-deps';
import { connect } from 'react-redux';
import { Route, IndexRoute } from 'react-router';
import CssLoader from '../components/CssLoader';
import * as selectors from '../selectors';
import * as deps from '../deps';

const mapStateToProps = state => ({ themeName: deps.selectors.getThemeName(state) });

class ThemeLoaderClass extends React.Component {
  render() {
    const Theme = dep('theme', 'components', 'Theme');
    return (
      <div id="root">
        <CssLoader />
        <Theme {...this.props} />
      </div>
    );
  }
}
const ThemeLoader = connect(mapStateToProps)(ThemeLoaderClass);

class EntryClass extends React.Component {
  render() {
    try {
      const Component = dep('theme', 'components', this.props.component);
      return <Component {...this.props} />;
    } catch (error) {
      const Component = dep('theme', 'components', 'Home');
      return <Component {...this.props} />;
    }
  }
}
EntryClass.propTypes = { component: React.PropTypes.string };
const Entry = connect(mapStateToProps)(EntryClass);

const Content = connect(state => ({
  contentType: selectors.getContentType(state),
}))(({ contentType }) => <Entry component={contentType} />);

const addSiteIdAndBaseHref = store =>
  (prevState, nextState, replace) => {
    const pathname = /^file.+index\.html/.test(window.location.href)
      ? /(.+index\.html)/.exec(window.location.href)[1] + nextState.location.pathname
      : nextState.location.pathname;
    const query = !nextState.location.query.siteId
      ? { ...nextState.location.query, siteId: store.getState().router.siteId }
      : nextState.location.query;
    if (pathname !== nextState.location.pathname || query !== nextState.location.query)
      replace({ pathname, query });
  };

export const routes = store => (
  <Route path="/" component={ThemeLoader}>
    <IndexRoute component={Content} onChange={addSiteIdAndBaseHref(store)} />
    <Route path="*" component={Content} onChange={addSiteIdAndBaseHref(store)} />
  </Route>
);

export default routes;
