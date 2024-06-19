import React from 'react';

import { useTranslation } from 'react-i18next';

function MyComp () {
  const { t } = useTranslation('welcome')
  return <h1>{t('welcome')}</h1>
}

export default MyComp;