import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import {
  faDollarSign,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { BaseEmoji } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import styled from 'styled-components'

import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import {
  selectGoalsMap,
  updateGoal as updateGoalRedux,
} from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { Theme } from '../../components/Theme'
import EmojiPicker from '../../components/EmojiPicker'

type Props = {
  goal: Goal
}

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()

  const reduxGoal = useAppSelector(selectGoalsMap)[props.goal.id]
  const currentGoal = reduxGoal || props.goal

  const [name, setName] = useState<string>('')
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number>(0)
  const [icon, setIcon] = useState<string>(
    currentGoal.icon || ''
  )
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] =
    useState(false)

  useEffect(() => {
    setName(currentGoal.name || '')

    setTargetDate(
      currentGoal.targetDate
        ? new Date(currentGoal.targetDate)
        : null
    )

    setTargetAmount(currentGoal.targetAmount || 0)
    setIcon(currentGoal.icon || '')
  }, [
    currentGoal.id,
    currentGoal.name,
    currentGoal.targetDate,
    currentGoal.targetAmount,
    currentGoal.icon,
  ])

  const buildUpdatedGoal = (
    changes: Partial<Goal>
  ): Goal => {
    return {
      ...currentGoal,
      name: name,
      targetDate:
        targetDate || currentGoal.targetDate,
      targetAmount: targetAmount,
      icon: icon || currentGoal.icon || '',
      ...changes,
    }
  }

  const saveGoal = (updatedGoal: Goal) => {
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateNameOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextName = event.target.value

    setName(nextName)

    const updatedGoal = buildUpdatedGoal({
      name: nextName,
    })

    saveGoal(updatedGoal)
  }

  const updateTargetAmountOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value

    if (value === '') {
      setTargetAmount(0)

      const updatedGoal = buildUpdatedGoal({
        targetAmount: 0,
      })

      saveGoal(updatedGoal)
      return
    }

    const nextTargetAmount = Number(value)

    if (Number.isNaN(nextTargetAmount)) {
      return
    }

    setTargetAmount(nextTargetAmount)

    const updatedGoal = buildUpdatedGoal({
      targetAmount: nextTargetAmount,
    })

    saveGoal(updatedGoal)
  }

  const pickDateOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value

    if (!value) {
      return
    }

    const selectedDate = new Date(
      `${value}T00:00:00`
    )

    if (Number.isNaN(selectedDate.getTime())) {
      return
    }

    setTargetDate(selectedDate)

    const updatedGoal = buildUpdatedGoal({
      targetDate: selectedDate,
    })

    saveGoal(updatedGoal)
  }

  const pickEmojiOnClick = (
    emoji: BaseEmoji,
    event: React.MouseEvent
  ) => {
    event.stopPropagation()

    const newIcon = emoji.native

    setIcon(newIcon)
    setIsEmojiPickerOpen(false)

    const updatedGoal = buildUpdatedGoal({
      icon: newIcon,
    })

    saveGoal(updatedGoal)
  }

  const handleIconButtonClick = (
    event: React.MouseEvent
  ) => {
    event.stopPropagation()
    setIsEmojiPickerOpen(!isEmojiPickerOpen)
  }

  const formattedTargetDate = targetDate
    ? [
        targetDate.getFullYear(),
        String(targetDate.getMonth() + 1).padStart(2, '0'),
        String(targetDate.getDate()).padStart(2, '0'),
      ].join('-')
    : ''

  return (
    <GoalManagerContainer>
      <IconSection>
        <IconButton onClick={handleIconButtonClick}>
          {icon || '➕ Add Icon'}
        </IconButton>

        {isEmojiPickerOpen && (
          <EmojiPickerContainer>
            <EmojiPicker onClick={pickEmojiOnClick} />
          </EmojiPickerContainer>
        )}

        {icon && <GoalIcon>{icon}</GoalIcon>}
      </IconSection>

      <NameInput
        value={name}
        onChange={updateNameOnChange}
      />

      <Group>
        <Field
          name="Target Date"
          icon={faCalendarAlt}
        />

        <Value>
          <DateInput
            type="date"
            value={formattedTargetDate}
            onChange={pickDateOnChange}
          />
        </Value>
      </Group>

      <Group>
        <Field
          name="Target Amount"
          icon={faDollarSign}
        />

        <Value>
          <StringInput
            value={targetAmount}
            onChange={updateTargetAmountOnChange}
          />
        </Value>
      </Group>

      <Group>
        <Field
          name="Balance"
          icon={faDollarSign}
        />

        <Value>
          <StringValue>
            {currentGoal.balance}
          </StringValue>
        </Value>
      </Group>

      <Group>
        <Field
          name="Date Created"
          icon={faCalendarAlt}
        />

        <Value>
          <StringValue>
            {new Date(
              currentGoal.created
            ).toLocaleDateString()}
          </StringValue>
        </Value>
      </Group>
    </GoalManagerContainer>
  )
}

type FieldProps = {
  name: string
  icon: IconDefinition
}

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon
      icon={props.icon}
      size="2x"
    />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

const IconSection = styled.div`
  position: relative;
`

const IconButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
`

const EmojiPickerContainer = styled.div`
  position: absolute;
  top: 2.5rem;
  left: 0;
  z-index: 1000;
`

const GoalIcon = styled.h1`
  font-size: 3rem;
  margin: 0.5rem 0;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const DateInput = styled.input`
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
  font-family: inherit;
  cursor: pointer;
`

const Value = styled.div`
  margin-left: 2rem;
`