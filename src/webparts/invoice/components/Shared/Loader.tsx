
 
// const Loading = () => {
//     return (
//         //class : cc-loading , class to apply mask
//         <div className="loader-bg">
//             <div className='loader'>
//                 {/* <div><img src={require('../Images/logo.jpg')} alt="" className='SynergyLogo'/></div> */}
 
//                 {/* <Beatloader size={15} margin={2} color={"rgb(51 220 186)"}></Beatloader> */}
               
//                 {/* <FadeLoader height={15} width={5} radius={2} margin={2} color={"rgb(51 220 186)"}></FadeLoader> */}
//             </div>
//             {/* <span color='#000'>Loading...</span> */}
//         </div>
//     );
// };
 
// export default Loading;


import * as ReactDOM from 'react-dom';

let container: HTMLDivElement | null = null;

const Loader = () => (
  <div className="loader-bg">
    <div className="loader"></div>
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


