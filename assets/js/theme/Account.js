import CoreAccount from './core/Account';
import SelectWrapper from './components/SelectWrapper';

export default class Account extends CoreAccount {
  selectWrapCallback($selectEl) {
    new SelectWrapper($selectEl);
  }
}
