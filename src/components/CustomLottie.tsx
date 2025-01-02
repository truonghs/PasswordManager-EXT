import Lottie from 'react-lottie'

type CustomLottieProps = {
  animationData: unknown
}

export const CustomLottie: React.FC<CustomLottieProps> = ({ animationData }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  }
  return (
    <div>
      <Lottie options={defaultOptions} height={200} width={200} />
    </div>
  )
}
