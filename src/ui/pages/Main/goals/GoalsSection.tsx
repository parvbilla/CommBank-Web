import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  createGoal as createGoalApi,
  getGoals,
} from '../../../../api/lib'
import {
  createGoal as createGoalRedux,
  selectGoalsList,
} from '../../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import {
  setContent as setContentRedux,
  setIsOpen as setIsOpenRedux,
  setType as setTypeRedux,
} from '../../../../store/modalSlice'
import { SectionHeading } from '../../../components/SectionHeading'
import { media } from '../../../utils/media'
import GoalsContent from './GoalsContent'

export default function GoalsSection() {
  const dispatch = useAppDispatch()
  const goalIds = useAppSelector(selectGoalsList)

  // Load latest saved goal after page refresh
useEffect(() => {
  async function fetchLatestGoal() {
    const goals = await getGoals()

    if (!goals || goals.length === 0) return

    const latestGoal = goals.reduce((latest, current) => {
      return new Date(current.created).getTime() >
        new Date(latest.created).getTime()
        ? current
        : latest
    })

    dispatch(createGoalRedux(latestGoal))
  }

  fetchLatestGoal()
}, [dispatch])

  const [isCreating, setIsCreating] = useState(false)

  const onClick = async () => {
    if (isCreating) return

    try {
      setIsCreating(true)

      const goal = await createGoalApi()

      if (!goal) {
        console.error('Goal creation failed')
        return
      }

      dispatch(createGoalRedux(goal))
      dispatch(setContentRedux(goal))
      dispatch(setTypeRedux('Goal'))
      dispatch(setIsOpenRedux(true))
    } catch (error) {
      console.error('Goal creation error:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Container>
      <TopGroup>
        <SectionHeading>Goals</SectionHeading>

        <IconButton
          type="button"
          onClick={onClick}
          disabled={isCreating}
          aria-label="Create new goal"
        >
          <FontAwesomeIcon
            icon={faPlusCircle}
            size="2x"
          />
        </IconButton>
      </TopGroup>

      <GoalsContent ids={goalIds} />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  margin-top: 2rem;
  margin-bottom: 2rem;

  ${media('<tablet')} {
    width: 100%;
  }
`

const TopGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  ${media('<tablet')} {
    flex-direction: column;
  }
`

const IconButton = styled.button`
  margin-left: 1rem;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`