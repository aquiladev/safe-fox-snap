import { ModalWrapper, Wrapper } from './SafeDetailsModal.style';

type Props = {
  meta: any;
};

export const SafeDetailsModalView = ({ meta }: Props) => {
  return (
    <ModalWrapper>
      <Wrapper>
        <pre style={{ padding: 0, margin: 0 }}>
          {JSON.stringify(meta, null, 2)}
        </pre>
      </Wrapper>
    </ModalWrapper>
  );
};
