
import * as ReactDOM from 'react-dom';

let container: HTMLDivElement | null = null;

const Loader = () => (
  <div className="loaderr-bg">
    <div className="loaderr"></div>
  </div>
);

export const showLoader = () => {
  if (container) return;

  container = document.createElement('div');
  container.id = 'global-loader-container';
  document.body.appendChild(container);

  ReactDOM.render(<Loader />, container);
};

export const hideLoader = () => {
  if (!container) return;

  ReactDOM.unmountComponentAtNode(container);
  document.body.removeChild(container);
  container = null;
};


