import PageManager from '../PageManager';
import UserDefinedContent from './components/UserDefinedContent';

export default class BlogPost extends PageManager {
  constructor() {
    super();

    this.$body = $(document.body);
  }

  loaded(next) {
    new UserDefinedContent(this.$body.find('.blog-post-content'));
  }
}
