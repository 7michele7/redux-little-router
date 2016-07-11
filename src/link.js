import React, { Component, PropTypes } from 'react';

import { PUSH, REPLACE } from './action-types';

const LEFT_MOUSE_BUTTON = 0;

const normalizeLocation = href => {
  if (typeof href === 'string') {
    const [pathname, query] = href.split('?');
    return query ? { pathname, query} : { pathname };
  }
  return href;
};

const resolveQueryForLocation = ({ linkLocation, persistQuery, currentLocation }) => {
  const currentQuery = currentLocation &&
    currentLocation.query;

  // Only use the query from state if it exists
  // and the href doesn't provide its own query
  if (persistQuery && currentQuery && !linkLocation.query) {
    return { pathname: linkLocation.pathname, query: currentQuery};
  }

  return linkLocation;
};

const clickedWithModifier = e =>
  e.button === LEFT_MOUSE_BUTTON &&
  (e.shiftKey || e.altKey || e.metaKey || e.ctrlKey);

const onClick = ({e, location, replaceState, router}) => {
  if (clickedWithModifier(e)) {
    return;
  }

  e.preventDefault();

  if (router) {
    router.store.dispatch({
      type: replaceState ? REPLACE : PUSH,
      payload: location
    });
  }
};

const Link = (props, context) => {
  const {
    href,
    persistQuery,
    replaceState,
    children
  } = props;
  const { router } = context;

  const locationDescriptor =
    resolveQueryForLocation({
      linkLocation: normalizeLocation(href),
      currentLocation: router.store.getState().router,
      persistQuery
    });

  const location = router.history
    .createLocation(locationDescriptor);

  return (
    <a
      {...props}
      href={router.history.createHref(location)}
      onClick={e => onClick({
        e,
        location,
        replaceState,
        router
      })}
    >
      {children}
    </a>
  );
};

Link.propTypes = {
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  replaceState: PropTypes.bool,
  persistQuery: PropTypes.bool,
  children: PropTypes.node
};

Link.contextTypes = {
  router: PropTypes.object
};

const PersistentQueryLink = class extends Component {
  render() {
    const { children, ...rest } = this.props;
    return <Link {...rest} persistQuery>{children}</Link>;
  }
};

PersistentQueryLink.propTypes = {
  children: PropTypes.node
};

PersistentQueryLink.contextTypes = {
  router: PropTypes.object
};

export { Link, PersistentQueryLink };
