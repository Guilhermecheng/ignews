import { render, screen } from '@testing-library/react'
import { mocked } from 'jest-mock'
import { useSession } from 'next-auth/react'
import { SignInButton } from '.'

jest.mock('next-auth/react')

describe('SignInButton', () => {
    it('renders correctly when user is not authenticated', () => {
        const useSessionMocked = mocked(useSession)

        useSessionMocked.mockReturnValueOnce({ data: null, status: "loading" })

        const { debug } = render(
            <SignInButton />
        )
        debug()
        expect(screen.getByText('Sign in with Github')).toBeInTheDocument()
    })    
})

