import { useLocation, useNavigate, useParams } from 'react-router-dom';

export function withRouter(Component: any) {
  return function (props: any) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  };
}
