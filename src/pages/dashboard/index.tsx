import React from 'react'
import {
  Box,
  SimpleGrid,
  Text,
  Button,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Input,
  Image,
  VStack,
  InputGroup,
  FormControl,
  FormLabel,
  Skeleton,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers'
import { ethers } from 'ethers'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { Head } from '../../components/layout/Head'
import * as hamsterverse from '../../utils/Hamsterverse.json'
import * as token from '../../utils/MockERC20.json'

interface NFTData {
  tokenId: number
  stakedAmount: string
  pendingRewards: string
  stakingTimestamp: number
  proxyAddress: string
}

const NFTCard = ({
  nft,
  onWithdrawRewards,
  isLoading,
  onNFTsChanged,
}: {
  nft: NFTData
  onWithdrawRewards: (tokenId: number) => Promise<void>
  isLoading: boolean
  onNFTsChanged: () => Promise<void>
}) => {
  const [delegateAddress, setDelegateAddress] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [additionalStakeAmount, setAdditionalStakeAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [nftRecipient, setNftRecipient] = useState('')

  const [isDelegating, setIsDelegating] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isTransferringNFT, setIsTransferringNFT] = useState(false)
  const [currentRewards, setCurrentRewards] = useState(Math.round(parseFloat(nft.pendingRewards)))

  // Set up the interval for incrementing rewards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRewards((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Update the initial rewards when nft.pendingRewards changes
  useEffect(() => {
    setCurrentRewards(Math.round(parseFloat(nft.pendingRewards)))
  }, [nft.pendingRewards])

  const { walletProvider } = useAppKitProvider('eip155')
  const toast = useToast()
  const stakingDate = new Date(nft.stakingTimestamp * 1000).toLocaleDateString()
  const timeStaked = Math.floor((Date.now() - nft.stakingTimestamp * 1000) / (1000 * 60 * 60 * 24))

  const handleDelegate = async () => {
    if (!walletProvider || !delegateAddress) return

    try {
      setIsDelegating(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)

      const tx = await nftContract.delegateStakedTokens(nft.tokenId, delegateAddress)
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Successfully delegated tokens!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      setDelegateAddress('')
      onNFTsChanged()
    } catch (error) {
      console.error('Error delegating:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delegate',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsDelegating(false)
    }
  }

  const handleTransfer = async () => {
    if (!walletProvider || !transferAmount) return

    try {
      setIsTransferring(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)

      const tx = await nftContract.withdraw(nft.tokenId, parseEther(transferAmount))
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Successfully transferred tokens!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      setTransferAmount('')
      onNFTsChanged()
    } catch (error) {
      console.error('Error transferring:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to transfer',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsTransferring(false)
    }
  }

  const handleAdditionalStake = async () => {
    if (!walletProvider || !additionalStakeAmount) return

    try {
      setIsStaking(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)
      const tokenContract = new Contract(token.address, token.abi, signer)

      // First approve
      const approveTx = await tokenContract.approve(hamsterverse.address, parseEther(additionalStakeAmount))
      await approveTx.wait()

      // Then stake
      const tx = await nftContract.addStake(nft.tokenId, parseEther(additionalStakeAmount))
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Successfully staked additional tokens!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      setAdditionalStakeAmount('')
      onNFTsChanged()
    } catch (error) {
      console.error('Error staking:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to stake',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleWithdraw = async () => {
    if (!walletProvider || !withdrawAmount) return

    try {
      setIsWithdrawing(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)

      const tx = await nftContract.withdraw(nft.tokenId, parseEther(withdrawAmount))
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Successfully withdrawn tokens!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      setWithdrawAmount('')
      onNFTsChanged()
    } catch (error) {
      console.error('Error withdrawing:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to withdraw',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleNFTTransfer = async () => {
    if (!walletProvider || !nftRecipient) return

    try {
      setIsTransferringNFT(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)

      const tx = await nftContract.transferFrom(await signer.getAddress(), nftRecipient, nft.tokenId)
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Successfully transferred NFT!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
      setNftRecipient('')
      onNFTsChanged()
    } catch (error) {
      console.error('Error transferring NFT:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to transfer NFT',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsTransferringNFT(false)
    }
  }

  return (
    <Box p={6} borderWidth={1} borderRadius="lg" _hover={{ borderColor: 'blue.500', boxShadow: 'md' }} transition="all 0.2s">
      <Heading size="md" mb={4} display="flex" alignItems="center" gap={4}>
        <Image
          src="https://bafkreicctn5ua3ctzctk62d4vpbsvipzlakdja4hzgh2nkwwauayrf76iy.ipfs.w3s.link/"
          alt="NFT"
          boxSize="40px"
          borderRadius="full"
          border="2px solid"
          borderColor="gray.200"
        />
        NFT #{nft.tokenId}
      </Heading>

      <SimpleGrid columns={2} spacing={4} mb={6}>
        <Stat>
          <StatLabel>Staked Amount</StatLabel>
          <StatNumber>{parseFloat(nft.stakedAmount).toFixed(2)}</StatNumber>
          <StatHelpText>RGCVII Tokens</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Pending Rewards</StatLabel>
          <StatNumber>{currentRewards}</StatNumber>
          <StatHelpText>RGCVII Tokens</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Staking Since</StatLabel>
          <StatNumber>{stakingDate}</StatNumber>
          <StatHelpText>{timeStaked} days</StatHelpText>
        </Stat>
        <Box>
          <Button colorScheme="blue" size="sm" width="full" onClick={() => onWithdrawRewards(nft.tokenId)} isLoading={isLoading} isDisabled={false}>
            Claim Rewards
          </Button>
        </Box>
      </SimpleGrid>

      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Delegate To</FormLabel>
          <InputGroup size="sm">
            <Input placeholder="Enter address" value={delegateAddress} onChange={(e) => setDelegateAddress(e.target.value)} />
            <Button
              ml={2}
              colorScheme="purple"
              size="sm"
              onClick={handleDelegate}
              isLoading={isDelegating}
              disabled={!delegateAddress || !ethers.isAddress(delegateAddress)}>
              Delegate
            </Button>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel>Stake Additional Tokens</FormLabel>
          <InputGroup size="sm">
            <Input type="number" placeholder="Amount" value={additionalStakeAmount} onChange={(e) => setAdditionalStakeAmount(e.target.value)} />
            <Button
              ml={2}
              colorScheme="green"
              size="sm"
              onClick={handleAdditionalStake}
              isLoading={isStaking}
              disabled={!additionalStakeAmount || parseFloat(additionalStakeAmount) <= 0}>
              Stake More
            </Button>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel>Withdraw Staked Tokens</FormLabel>
          <InputGroup size="sm">
            <Input type="number" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
            <Button
              ml={2}
              colorScheme="red"
              size="sm"
              onClick={handleWithdraw}
              isLoading={isWithdrawing}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}>
              Withdraw
            </Button>
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel>Transfer NFT</FormLabel>
          <InputGroup size="sm">
            <Input placeholder="Recipient address" value={nftRecipient} onChange={(e) => setNftRecipient(e.target.value)} />
            <Button
              ml={2}
              colorScheme="orange"
              size="sm"
              onClick={handleNFTTransfer}
              isLoading={isTransferringNFT}
              disabled={!nftRecipient || !ethers.isAddress(nftRecipient)}>
              Transfer NFT
            </Button>
          </InputGroup>
        </FormControl>
      </VStack>

      <Text mt={4} fontSize="sm" color="gray.500">
        Proxy: {nft.proxyAddress.slice(0, 6)}...{nft.proxyAddress.slice(-4)}
      </Text>
    </Box>
  )
}

export default function Dashboard() {
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true)
  const [processingTokenId, setProcessingTokenId] = useState<number | null>(null)

  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const toast = useToast()

  const fetchNFTs = async () => {
    if (!isConnected || !walletProvider || !address) return

    try {
      setIsLoadingNFTs(true)
      const ethersProvider = new BrowserProvider(walletProvider as any)
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, ethersProvider)

      // Get balance of NFTs
      const balance = await nftContract.balanceOf(address)
      console.log('NFT balance:', balance)

      let nftData: NFTData[] = []

      // Fetch each NFT's data
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)

          console.log('Fetching data for tokenId:', tokenId)

          const info = await nftContract.getStakeInfo(tokenId)
          console.log('Raw NFT info:', info)

          // Correctly map the returned values based on the contract's function
          const formattedNFT: NFTData = {
            tokenId: Number(tokenId),
            stakedAmount: formatEther(info[0]), // stakedAmount
            pendingRewards: formatEther(info[1]), // pendingRewards
            stakingTimestamp: Number(info[2]), // stakingTimestamp
            proxyAddress: info[3], // proxyAddress
          }

          nftData.push(formattedNFT)
        } catch (error) {
          console.error('Error processing NFT:', i, error)
        }
      }

      console.log('Processed NFT data:', nftData)
      setNfts(nftData)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch NFTs',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsLoadingNFTs(false)
    }
  }

  const handleWithdrawRewards = async (tokenId: number) => {
    if (!isConnected || !walletProvider) return

    try {
      setProcessingTokenId(tokenId)
      setIsLoading(true)

      const ethersProvider = new BrowserProvider(walletProvider as any)
      const signer = await ethersProvider.getSigner()
      const nftContract = new Contract(hamsterverse.address, hamsterverse.abi, signer)

      const tx = await nftContract.withdrawRewards(tokenId)
      await tx.wait()

      toast({
        title: 'Success',
        description: 'Rewards claimed successfully!',
        status: 'success',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })

      // Refresh NFT data
      await fetchNFTs()
    } catch (error) {
      console.error('Error withdrawing rewards:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to claim rewards',
        status: 'error',
        position: 'bottom',
        variant: 'subtle',
        duration: 9000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
      setProcessingTokenId(null)
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchNFTs()
    }
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <Box p={4}>
        <Text>Please connect your wallet to view your NFTs.</Text>
      </Box>
    )
  }

  return (
    <>
      <Head title="Dashboard | Hamsterverse" description="View and manage your Hamsterverse NFTs" />
      <Box p={4}>
        <Heading mb={6}>Your NFTs</Heading>

        {isLoadingNFTs ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[1, 2].map((i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : nfts.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" mb={4}>
              No NFTs found
            </Text>
            <Button colorScheme="blue" onClick={() => (window.location.href = '/')}>
              Mint Your First NFT
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {nfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onWithdrawRewards={handleWithdrawRewards}
                isLoading={isLoading && processingTokenId === nft.tokenId}
                onNFTsChanged={fetchNFTs}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </>
  )
}
