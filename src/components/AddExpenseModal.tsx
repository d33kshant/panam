import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ExpenseService } from '../services/ExpenseService';
import { NotificationService } from '../services/NotificationService';
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
    groupId: string;
    onAdd?: () => void;
}

type SplitType = 'even' | 'percent' | 'amount' | 'shares';

/**
 * Rounds an array of numbers so they sum to `target` while keeping
 * each value as close to the ideal as possible (largest-remainder method).
 */
function distributeEvenly(target: number, count: number): number[] {
    if (count === 0) return [];
    const base = Math.floor((target * 100) / count) / 100; // per-person base (2 decimals)
    const baseTotal = parseFloat((base * count).toFixed(2));
    const remainder = parseFloat((target - baseTotal).toFixed(2));
    const extraCents = Math.round(remainder * 100); // how many people get +0.01

    const result: number[] = [];
    for (let i = 0; i < count; i++) {
        result.push(i < extraCents ? parseFloat((base + 0.01).toFixed(2)) : base);
    }
    return result;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    /** Computed final amount per selected member uid */
    finalAmounts: Record<string, number>;
}

function validate(
    totalAmount: number,
    note: string,
    splitType: SplitType,
    selectedMembers: string[],
    memberValues: Record<string, string>,
): ValidationResult {
    const errors: string[] = [];
    const finalAmounts: Record<string, number> = {};

    // ── Basic checks ──────────────────────────────────────────────
    if (!note.trim()) {
        errors.push('Note is required');
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
        errors.push('Amount is required');
        return { isValid: false, errors, finalAmounts };
    }

    if (selectedMembers.length === 0) {
        errors.push('No members selected');
        return { isValid: false, errors, finalAmounts };
    }

    // ── Split-specific validation ─────────────────────────────────
    switch (splitType) {
        case 'even': {
            const amounts = distributeEvenly(totalAmount, selectedMembers.length);
            selectedMembers.forEach((uid, i) => {
                finalAmounts[uid] = amounts[i];
            });
            break;
        }

        case 'percent': {
            let totalPercent = 0;
            let hasInvalid = false;

            for (const uid of selectedMembers) {
                const raw = memberValues[uid] ?? '';
                if (raw === '') {
                    errors.push('All members need a percentage');
                    hasInvalid = true;
                    break;
                }
                const pct = parseFloat(raw);
                if (isNaN(pct) || pct < 0) {
                    errors.push('Invalid percentage value');
                    hasInvalid = true;
                    break;
                }
                if (pct > 100) {
                    errors.push('Percentage cannot exceed 100%');
                    hasInvalid = true;
                    break;
                }
                totalPercent += pct;
                finalAmounts[uid] = parseFloat(((pct / 100) * totalAmount).toFixed(2));
            }

            if (!hasInvalid) {
                const roundedTotal = parseFloat(totalPercent.toFixed(2));
                if (roundedTotal !== 100) {
                    errors.push(`Percentages total ${roundedTotal}%, must be 100%`);
                }
            }
            break;
        }

        case 'amount': {
            let assignedTotal = 0;
            let hasInvalid = false;

            for (const uid of selectedMembers) {
                const raw = memberValues[uid] ?? '';
                if (raw === '') {
                    errors.push('All members need an amount');
                    hasInvalid = true;
                    break;
                }
                const amt = parseFloat(raw);
                if (isNaN(amt) || amt < 0) {
                    errors.push('Invalid amount value');
                    hasInvalid = true;
                    break;
                }
                if (amt > totalAmount) {
                    errors.push('Amount exceeds total');
                    hasInvalid = true;
                    break;
                }
                assignedTotal += amt;
                finalAmounts[uid] = parseFloat(amt.toFixed(2));
            }

            if (!hasInvalid) {
                const roundedAssigned = parseFloat(assignedTotal.toFixed(2));
                if (roundedAssigned !== totalAmount) {
                    const diff = parseFloat((totalAmount - roundedAssigned).toFixed(2));
                    errors.push(
                        diff > 0 ? `₹${diff} unassigned` : `Exceeds total by ₹${Math.abs(diff)}`,
                    );
                }
            }
            break;
        }

        case 'shares': {
            let totalShares = 0;
            let hasInvalid = false;

            for (const uid of selectedMembers) {
                const raw = memberValues[uid] ?? '';
                if (raw === '') {
                    errors.push('All members need a share value');
                    hasInvalid = true;
                    break;
                }
                const share = parseFloat(raw);
                if (isNaN(share) || share < 0) {
                    errors.push('Invalid share value');
                    hasInvalid = true;
                    break;
                }
                totalShares += share;
            }

            if (!hasInvalid) {
                if (totalShares <= 0) {
                    errors.push('Total shares must be > 0');
                } else {
                    // Compute raw amounts then use largest-remainder to fix rounding
                    const rawAmounts = selectedMembers.map((uid) => {
                        const share = parseFloat(memberValues[uid] ?? '0');
                        return (share / totalShares) * totalAmount;
                    });

                    // Round to 2 decimals, then fix the remainder
                    const rounded = rawAmounts.map((a) => parseFloat(a.toFixed(2)));
                    const roundedSum = parseFloat(rounded.reduce((s, v) => s + v, 0).toFixed(2));
                    let diff = parseFloat((totalAmount - roundedSum).toFixed(2));
                    const diffCents = Math.round(diff * 100);

                    if (diffCents !== 0) {
                        // Distribute rounding cents to members with largest fractional parts
                        const fractions = rawAmounts.map((a, i) => ({
                            i,
                            frac: a - Math.floor(a * 100) / 100,
                        }));
                        fractions.sort((a, b) => b.frac - a.frac);

                        const sign = diffCents > 0 ? 1 : -1;
                        for (let k = 0; k < Math.abs(diffCents); k++) {
                            rounded[fractions[k % fractions.length].i] = parseFloat(
                                (rounded[fractions[k % fractions.length].i] + sign * 0.01).toFixed(2),
                            );
                        }
                    }

                    selectedMembers.forEach((uid, i) => {
                        finalAmounts[uid] = rounded[i];
                    });
                }
            }
            break;
        }
    }

    return { isValid: errors.length === 0, errors, finalAmounts };
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, members, groupId, onAdd }) => {
    const { user } = useAuth();
    const [splitType, setSplitType] = React.useState<SplitType>('even');
    const [openAccordions, setOpenAccordions] = React.useState<string | string[]>(['details']);
    const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
    const [totalAmount, setTotalAmount] = React.useState<string>('');
    const [note, setNote] = React.useState<string>('');
    /** Per-member input values — keys are uid, values are raw input strings */
    const [memberValues, setMemberValues] = React.useState<Record<string, string>>({});

    // ── Reset state when modal opens ──────────────────────────────
    React.useEffect(() => {
        if (isOpen) {
            setSelectedMembers(members.map((m) => m.uid));
            setTotalAmount('');
            setNote('');
            setMemberValues({});
            setSplitType('even');
            setOpenAccordions(['details']);
        }
    }, [isOpen, members]);

    // ── Clear per-member values when split type changes ───────────
    React.useEffect(() => {
        setMemberValues({});
    }, [splitType]);

    const toggleMember = (uid: string) => {
        setSelectedMembers((prev) => {
            const next = prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid];
            // Also remove the member's value entry when unchecked
            if (!next.includes(uid)) {
                setMemberValues((v) => {
                    const copy = { ...v };
                    delete copy[uid];
                    return copy;
                });
            }
            return next;
        });
    };

    const setMemberValue = (uid: string, value: string) => {
        setMemberValues((prev) => ({ ...prev, [uid]: value }));
    };

    // ── Derived validation ────────────────────────────────────────
    const parsedTotal = parseFloat(totalAmount);
    const { isValid, errors, finalAmounts } = validate(
        parsedTotal,
        note,
        splitType,
        selectedMembers,
        memberValues,
    );

    // ── Helpers ───────────────────────────────────────────────────
    const getInputSuffix = () => {
        switch (splitType) {
            case 'percent':
                return '%';
            case 'shares':
                return '';
            default:
                return '₹';
        }
    };

    const isInputReadonly = splitType === 'even';

    const getDisplayValueForEven = (uid: string): string => {
        if (splitType !== 'even') return memberValues[uid] ?? '';
        if (isNaN(parsedTotal) || parsedTotal <= 0 || selectedMembers.length === 0) return '';
        const amounts = distributeEvenly(parsedTotal, selectedMembers.length);
        const idx = selectedMembers.indexOf(uid);
        return idx >= 0 ? amounts[idx].toString() : '';
    };

    const formatFinalAmount = (uid: string): string => {
        const amt = finalAmounts[uid];
        if (amt === undefined || isNaN(amt)) return '₹0.00';
        return `₹${amt.toFixed(2)}`;
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
                                    value={note}
                                    onIonInput={(e) => setNote(e.detail.value ?? '')}
                                ></IonInput>
                            </IonItem>
                            <IonItem>
                                <IonInput
                                    label="Amount"
                                    labelPlacement="floating"
                                    placeholder="0.00"
                                    type="number"
                                    value={totalAmount}
                                    onIonInput={(e) => setTotalAmount(e.detail.value ?? '')}
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
                                    onIonChange={(e) => setSplitType(e.detail.value as SplitType)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <IonSegmentButton value="even">
                                        <IonIcon icon={evenIcon} />
                                        <IonLabel>Even</IonLabel>
                                    </IonSegmentButton>
                                    <IonSegmentButton value="percent">
                                        <IonIcon icon={percentIcon} />
                                        <IonLabel>Percent</IonLabel>
                                    </IonSegmentButton>
                                    <IonSegmentButton value="amount">
                                        <IonIcon icon={amountIcon} />
                                        <IonLabel>Amount</IonLabel>
                                    </IonSegmentButton>
                                    <IonSegmentButton value="shares">
                                        <IonIcon icon={sharesIcon} />
                                        <IonLabel>Shares</IonLabel>
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
                                                <div slot="end" style={{ display: 'flex', alignItems: 'center', width: '90px' }}>
                                                    <IonInput
                                                        type="number"
                                                        placeholder="0"
                                                        style={{ textAlign: 'right', flex: 1 }}
                                                        readonly={isInputReadonly}
                                                        value={getDisplayValueForEven(member.uid)}
                                                        onIonInput={(e) => {
                                                            if (!isInputReadonly) {
                                                                setMemberValue(member.uid, e.detail.value ?? '');
                                                            }
                                                        }}
                                                    />
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: '16px',
                                                        textAlign: 'center',
                                                        marginLeft: '4px',
                                                        color: 'var(--ion-color-medium)',
                                                        fontSize: '0.9em'
                                                    }}>
                                                        {getInputSuffix()}
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
                                <>
                                    {members
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
                                                    {formatFinalAmount(member.uid)}
                                                </div>
                                            </IonItem>
                                        ))}
                                </>
                            )}
                        </IonList>
                    </IonAccordion>
                </IonAccordionGroup>
                {errors.length > 0 && (
                    <IonItem>
                        <IonLabel color="danger" className="ion-text-center">
                            {errors.join(' • ')}
                        </IonLabel>
                    </IonItem>
                )}
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <div className="ion-padding">
                        <IonButton
                            expand="block"
                            disabled={!isValid}
                            onClick={async () => {
                                if (!isValid || !user) return;
                                const splits: Record<string, { amount: number; settled: boolean }> = {};
                                for (const uid of selectedMembers) {
                                    splits[uid] = {
                                        amount: finalAmounts[uid],
                                        settled: uid === user.uid,
                                    };
                                }
                                const created = await ExpenseService.create({
                                    groupId,
                                    note: note.trim(),
                                    totalAmount: parsedTotal,
                                    createdBy: user.uid,
                                    createdAt: new Date().toISOString(),
                                    splits,
                                });
                                // Notify other members
                                const otherMembers = selectedMembers.filter((uid) => uid !== user.uid);
                                if (otherMembers.length > 0) {
                                    const creatorName = user.displayName || 'Someone';
                                    const message = `${creatorName} added "${note.trim()}" — ₹${parsedTotal.toLocaleString()}`;
                                    await NotificationService.sendToMany(
                                        otherMembers,
                                        message,
                                        `exp:${groupId}:${created.id}`,
                                    );
                                }
                                onClose();
                                onAdd?.();
                            }}
                        >
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
