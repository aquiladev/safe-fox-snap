import { FC } from 'react';
import { IListProps } from '../List/List.view';
import { Wrapper } from './SafesList.style';
import { SafeListItem } from './SafeListItem';

type Props = {
  safes: string[];
};

export const SafesListView = ({ safes }: Props) => {
  return (
    <Wrapper<FC<IListProps<string>>>
      data={safes || []}
      render={(account) => <SafeListItem account={account} />}
      keyExtractor={(account) => account}
    />
  );
};
