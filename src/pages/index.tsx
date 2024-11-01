import React from 'react'
import { Text, Button, useToast, Box, Input, FormControl, FormLabel, InputGroup, InputRightAddon } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, Eip1193Provider, parseEther, formatEther } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { ERC20_CONTRACT_ADDRESS, ERC20_CONTRACT_ABI } from '../utils/erc20'
import { LinkComponent } from '../components/layout/LinkComponent'
import { Head } from '../components/layout/Head'
import { SITE_NAME, SITE_DESCRIPTION } from '../utils/config'
import * as hamsterverse from '../utils/Hamsterverse.json'
import * as token from '../utils/MockERC20.json'

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [balance, setBalance] = useState<string>('0')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [network, setNetwork] = useState<string>('Unknown')
  const [mintAmount, setMintAmount] = useState<string>('')

  const { address, isConnected, caipAddress } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const toast = useToast()

  useEffect(() => {
    if (isConnected) {
      setTxHash(undefined)
      getNetwork()
      getBal()
      getTokenBalance()
      console.log('user address:', address)
    }
  }, [isConnected, address, caipAddress])

  const getBal = async () => {
    if (isConnected && walletProvider) {
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const balance = await ethersProvider.getBalance(address as any)
      const ethBalance = formatEther(balance)
      setBalance(parseFloat(ethBalance).toFixed(5))
    }
  }

  const getTokenBalance = async () => {
    if (isConnected && walletProvider && address) {
      try {
        const ethersProvider = new BrowserProvider(walletProvider as any)
        const tokenContract = new Contract(token.address, token.abi, ethersProvider)
        const balance = await tokenContract.balanceOf(address)
        setTokenBalance(formatEther(balance))
      } catch (error) {
        console.error('Error fetching token balance:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch token balance',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
      }
    }
  }

  const getNetwork = async () => {
    if (walletProvider) {
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const network = await ethersProvider.getNetwork()
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
      setNetwork(capitalize(network.name))
    }
  }

  const doSomething = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to mint',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      return
    }

    setTxHash(undefined)
    try {
      if (!isConnected) {
        toast({
          title: 'Not connected',
          description: 'Please connect your wallet first',
          status: 'error',
          position: 'bottom',
          variant: 'subtle',
          duration: 9000,
          isClosable: true,
        })
        return
      }

      if (walletProvider) {
        setIsLoading(true)
        setTxHash('')
        setTxLink('')
        const ethersProvider = new BrowserProvider(walletProvider as Eip1193Provider)
        const signer = await ethersProvider.getSigner()

        const nft = new Contract(hamsterverse.address, hamsterverse.abi, signer)
        const erc20 = new Contract(token.address, token.abi, signer)

        // Approve
        const approve = await erc20.approve(hamsterverse.address, parseEther(mintAmount))
        await approve.wait(1)

        // Mint
        const uri = 'ipfs://bafkreiglxpmys7hxse45nd3ajnjzq2vjjevrlwjphtcco3pd53eq6zqu5i'
        const call = await nft.mint(signer.address, parseEther(mintAmount), uri)

        const receipt = await call.wait()
        if (!receipt) {
          throw new Error('Transaction failed')
        }

        console.log('tx:', receipt)
        setTxHash(receipt.hash)
        setTxLink('https://sepolia.etherscan.io/tx/' + receipt.hash)
        setIsLoading(false)

        // Refresh balances
        await getTokenBalance()
        await getBal()

        toast({
          title: 'Success',
          description: 'Mint successful! 🎉',
          status: 'success',
          position: 'bottom',
          variant: 'subtle',
          duration: 20000,
          isClosable: true,
        })
      }
    } catch (e) {
      setIsLoading(false)
      console.error('Error in doSomething:', e)
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Transaction failed',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  const openEtherscan = () => {
    if (address) {
      const baseUrl = network.toLowerCase() === 'sepolia' ? 'https://sepolia.etherscan.io/address/' : 'https://etherscan.io/address/'
      window.open(baseUrl + address, '_blank')
    }
  }

  return (
    <>
      <Head title={SITE_NAME} description={SITE_DESCRIPTION} />
      <main>
        {!isConnected ? (
          <>
            <Text>You can login with your email, Google, or with one of many wallets supported by Reown.</Text>
            <br />
          </>
        ) : (
          <Box
            p={4}
            borderWidth={1}
            borderRadius="lg"
            my={2}
            mb={8}
            onClick={openEtherscan}
            cursor="pointer"
            _hover={{ borderColor: 'blue.500', boxShadow: 'md' }}>
            <Text>
              Network: <strong>{network}</strong>
            </Text>
            <Text>
              ETH Balance: <strong>{balance} ETH</strong>
            </Text>
            <Text>
              Token Balance: <strong>{tokenBalance} RGCVII</strong>
            </Text>
            <Text>
              Address: <strong>{address || 'Not connected'}</strong>
            </Text>
          </Box>
        )}

        <Box mb={8}>
          <FormControl>
            <FormLabel>Amount to Mint</FormLabel>
            <InputGroup>
              <Input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={!isConnected}
                mb={4}
              />
              <InputRightAddon>RGCVII</InputRightAddon>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="blue"
            variant="outline"
            onClick={doSomething}
            isLoading={isLoading}
            loadingText="Minting..."
            spinnerPlacement="end"
            isDisabled={!isConnected || !mintAmount}>
            Mint
          </Button>
        </Box>

        {txHash && (
          <Text py={4} fontSize="14px" color="blue.400">
            <LinkComponent href={txLink ? txLink : ''}>{txHash}</LinkComponent>
          </Text>
        )}
      </main>
    </>
  )
}
