import React from 'react'
import styled from 'styled-components'
import { Goal } from '../../../api/types'
import { useAppSelector } from '../../../store/hooks'
import {
  selectContent,
  selectIsOpen,
  selectType,
} from '../../../store/modalSlice'
import { GoalManager } from '../../features/goalmanager/GoalManager'

export default function Modal() {
  const isOpen = useAppSelector(selectIsOpen)
  const content = useAppSelector(selectContent)
  const type = useAppSelector(selectType)

  if (!isOpen || content === null) {
    return null
  }

  const renderContent = () => {
    switch (type) {
      case 'Goal':
        return <GoalManager goal={content as Goal} />

      default:
        return null
    }
  }

  const onClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
    <Container onClick={onClick}>
      {renderContent()}
    </Container>
  )
}

export const Container = styled.div`
  width: 85%;
  max-width: 1000px;
  height: 85%;

  background-color: ${({ theme }) => theme.modalBackground};

  border-radius: 2rem;

  padding: 8rem;

  z-index: 10000;

  overflow: visible;
`