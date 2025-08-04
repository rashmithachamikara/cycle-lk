import { Loader } from '../../ui';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return <Loader message={message} />;
};

export default LoadingState;
