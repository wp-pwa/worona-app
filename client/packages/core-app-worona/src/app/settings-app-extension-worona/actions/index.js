import * as types from '../types';

export const appSettingsRequested = () =>
  ({ type: types.APP_SETTINGS_REQUESTED });
export const appSettingsSucceed = ({ settings, pkgs }) =>
  ({ type: types.APP_SETTINGS_SUCCEED, settings, pkgs });
export const appSettingsFailed = ({ error }) =>
  ({ type: types.APP_SETTINGS_FAILED, error });
