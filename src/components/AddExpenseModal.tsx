import React from 'react';
import {
    IonModal,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonAvatar,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonInput,
} from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import addIcon from './icons/add.svg';
import evenIcon from './icons/even.svg';
import percentIcon from './icons/percent.svg';
import amountIcon from './icons/amount.svg';
import sharesIcon from './icons/shares.svg';
import { MemberInfo } from '../pages/GroupPage';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    members: MemberInfo[];
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, members }) => {
    const [splitType, setSplitType] = React.useState('even');
    const [openAccordions, setOpenAccordions] = React.useState<string | string[]>(['details']);
    const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedMembers(members.map((m) => m.uid));
        }
    }, [isOpen, members]);

    const toggleMember = (uid: string) => {
        setSelectedMembers((prev) =>
            prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
        );
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Add Expense</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onClose}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonAccordionGroup
                    multiple={true}
                    value={openAccordions}
                    onIonChange={(e: any) => {
                        if (e.target.tagName === 'ION-ACCORDION-GROUP') {
                            setOpenAccordions(e.detail.value);
                        }
                    }}
                >
                    <IonAccordion value="details">
                        <IonItem slot="header" color="light">
                            <IonLabel>Details</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            <IonItem>
                                <IonInput
                                    label="Note"
                                    labelPlacement="floating"
                                    placeholder="What was this expense for?"
                                    type="text"
                                ></IonInput>
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Amount"
                                    labelPlacement="floating"
                                    placeholder="0.00"
                                    type="number"
                                ></IonInput>
                            </IonItem>
                        </IonList>
                    </IonAccordion>

                    <IonAccordion value="members">
                        <IonItem slot="header" color="light">
                            <IonLabel>Members</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            {members.map((member) => (
                                <IonItem key={member.uid}>
                                    <IonCheckbox
                                        slot="start"
                                        checked={selectedMembers.includes(member.uid)}
                                        onIonChange={() => toggleMember(member.uid)}
                                    />
                                    <IonAvatar slot="start" style={{ width: '32px', height: '32px' }}>
                                        {member.avatar ? (
                                            <img src={member.avatar} alt="avatar" />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'var(--ion-background-color-step-200)',
                                            }}>
                                                <IonIcon icon={personOutline} />
                                            </div>
                                        )}
                                    </IonAvatar>
                                    <IonLabel>{member.name}</IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonAccordion>

                    <IonAccordion value="contribution">
                        <IonItem slot="header" color="light">
                            <IonLabel>Contribution</IonLabel>
                        </IonItem>
                        <div slot="content" style={{ backgroundColor: 'var(--ion-item-background, var(--ion-background-color))' }}>
                            <div className="ion-padding">
                                <IonSegment
                                    value={splitType}
                                    onIonChange={(e) => setSplitType(e.detail.value as string)}
                                    mode="ios"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <IonSegmentButton value="even">
                                        <IonIcon icon={evenIcon} />
                                    </IonSegmentButton>
                                    <IonSegmentButton value="percent">
                                        <IonIcon icon={percentIcon} />
                                    </IonSegmentButton>
                                    <IonSegmentButton value="amount">
                                        <IonIcon icon={amountIcon} />
                                    </IonSegmentButton>
                                    <IonSegmentButton value="shares">
                                        <IonIcon icon={sharesIcon} />
                                    </IonSegmentButton>
                                </IonSegment>
                            </div>

                            <IonList className="ion-no-padding ion-no-margin">
                                {selectedMembers.length === 0 ? (
                                    <IonItem>
                                        <IonLabel color="medium" className="ion-text-center">No members are selected.</IonLabel>
                                    </IonItem>
                                ) : (
                                    members
                                        .filter((m) => selectedMembers.includes(m.uid))
                                        .map((member) => (
                                            <IonItem key={member.uid}>
                                                <IonAvatar slot="start" style={{ width: '32px', height: '32px' }}>
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt="avatar" />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: 'var(--ion-background-color-step-200)',
                                                        }}>
                                                            <IonIcon icon={personOutline} />
                                                        </div>
                                                    )}
                                                </IonAvatar>
                                                <IonLabel>{member.name}</IonLabel>
                                                <div slot="end" style={{ display: 'flex', alignItems: 'center', minWidth: '120px' }}>
                                                    <IonInput
                                                        type="number"
                                                        placeholder="0"
                                                        style={{ textAlign: 'right' }}
                                                    />
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: '16px',
                                                        textAlign: 'center',
                                                        marginLeft: '4px',
                                                        color: 'var(--ion-color-medium)',
                                                        fontSize: '0.9em'
                                                    }}>
                                                        {splitType === 'percent' ? '%' : (splitType === 'shares' ? '' : '₹')}
                                                    </span>
                                                </div>
                                            </IonItem>
                                        ))
                                )}
                            </IonList>
                        </div>
                    </IonAccordion>

                    <IonAccordion value="final_amount">
                        <IonItem slot="header" color="light">
                            <IonLabel>Final Amount</IonLabel>
                        </IonItem>
                        <IonList slot="content" className="ion-no-padding ion-no-margin">
                            {selectedMembers.length === 0 ? (
                                <IonItem>
                                    <IonLabel color="medium" className="ion-text-center">No members are selected.</IonLabel>
                                </IonItem>
                            ) : (
                                members
                                    .filter((m) => selectedMembers.includes(m.uid))
                                    .map((member) => (
                                        <IonItem key={`final_${member.uid}`}>
                                            <IonAvatar slot="start" style={{ width: '32px', height: '32px' }}>
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt="avatar" />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'var(--ion-background-color-step-200)',
                                                    }}>
                                                        <IonIcon icon={personOutline} />
                                                    </div>
                                                )}
                                            </IonAvatar>
                                            <IonLabel>{member.name}</IonLabel>
                                            <div slot="end" style={{
                                                fontWeight: 600,
                                            }}>
                                                ₹0
                                            </div>
                                        </IonItem>
                                    ))
                            )}
                        </IonList>
                    </IonAccordion>
                </IonAccordionGroup>
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <div className="ion-padding">
                        <IonButton expand="block">
                            <IonIcon slot="start" icon={addIcon} />
                            Add
                        </IonButton>
                    </div>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
};

export default AddExpenseModal;
