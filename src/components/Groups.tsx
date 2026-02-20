import { useState, useEffect } from 'react';
import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonList,
    IonListHeader,
    IonLabel,
    IonButton,
    IonItem,
    IonAvatar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import groupIcon from './icons/group.svg';
import { Group, GroupService } from '../services/GroupService';

interface GroupsProps {
    onGroupClick?: (group: Group) => void;
    limit?: number;
}

const Groups: React.FC<GroupsProps> = ({ onGroupClick, limit }) => {
    const history = useHistory();
    const [groups, setGroups] = useState<Group[]>(GroupService.getAll());

    useEffect(() => {
        const unsubscribe = GroupService.subscribe(() => {
            setGroups(GroupService.getAll());
        });
        return unsubscribe;
    }, []);

    const handleGroupClick = (group: Group) => {
        if (onGroupClick) {
            onGroupClick(group);
        } else {
            history.push(`/money/groups/${group.id}`);
        }
    };

    return (
        <IonCard>
            <IonListHeader>
                <IonLabel><h2><strong>Groups</strong></h2></IonLabel>
                {limit && (
                    <IonButton routerLink="/money/groups">See all</IonButton>
                )}
            </IonListHeader>
            {groups.length === 0 ? (
                <IonCardContent className="ion-text-center ion-padding">
                    <IonIcon icon={groupIcon} size="large" color="medium" />
                    <h3>No groups yet</h3>
                    <p>Join or create a group to see it here.</p>
                </IonCardContent>
            ) : (
                <IonList>
                    {(limit ? groups.slice(0, limit) : groups).map((group) => (
                        <IonItem
                            key={group.id}
                            button
                            detail
                            onClick={() => handleGroupClick(group)}
                        >
                            <IonAvatar slot="start" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'var(--ion-background-color-step-200)',
                            }}>
                                <IonIcon icon={groupIcon} />
                            </IonAvatar>
                            <IonLabel>
                                <h3>{group.name}</h3>
                                <p>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</p>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            )}
        </IonCard>
    );
};

export default Groups;
