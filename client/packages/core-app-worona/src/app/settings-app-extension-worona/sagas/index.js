/* eslint-disable no-unused-vars */
import request from 'superagent';
import { put, fork, call, select } from 'redux-saga/effects';
import { isDev, getDevelopmentPackages } from 'worona-deps';
import { toArray, uniqBy } from 'lodash';
import { flow, keyBy, mapValues } from 'lodash/fp';
import * as actions from '../actions';
import * as selectors from '../selectors';
import * as deps from '../deps';

export function* retrieveSettings() {
  yield put(actions.appSettingsRequested());
  const siteId = yield select(selectors.getSiteId);
  try {
    // Call the API.
    const env = isDev ? 'dev' : 'prod';
    const res = yield call(request.get,
      `https://cdn.worona.io/api/v1/settings/site/${siteId}/app/${env}/live`);
    const settings = flow(
      keyBy(setting => setting.woronaInfo.namespace),
      mapValues((setting) => { const { woronaInfo, ...rest } = setting; return rest; })
    )(res.body);
    // Extract the packages info from settings.
    const devPkgs = getDevelopmentPackages();
    const pkgs = uniqBy(
      toArray(devPkgs).concat(res.body).map(setting => setting.woronaInfo),
      pkg => pkg.namespace
    );
    // Inform that the API call was successful.
    yield put(actions.appSettingsSucceed({ settings, pkgs }));
    // Start activation for each downloaded package.
    yield toArray(pkgs).map(pkg => put(deps.actions.packageActivationRequested({ pkg })));
  } catch (error) {
    yield put(actions.appSettingsFailed({ error }));
  }
}

export default function* settingsSagas() {
  yield [
    fork(retrieveSettings),
  ];
}
